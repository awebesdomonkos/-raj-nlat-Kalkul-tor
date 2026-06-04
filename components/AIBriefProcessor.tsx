
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Type, LiveServerMessage, Modality, Blob } from "@google/genai";
import { MagicWandIcon, LoaderIcon, ChevronDownIcon, MicrophoneIcon, StopIcon } from './icons';
import { BASE_PACKAGES, EXTRAS, HOURLY_RATE } from '../constants';
import { PackageId } from '../types';
import { AIQuoteResponse } from '../types';

interface AIBriefProcessorProps {
    onGenerate: (data: AIQuoteResponse) => void;
}

// Helper function from Gemini guidelines to encode raw audio bytes to base64
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const AIBriefProcessor: React.FC<AIBriefProcessorProps> = ({ onGenerate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const briefRef = useRef<HTMLDivElement>(null);

    const [isRecording, setIsRecording] = useState(false);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const handleStopRecording = useCallback(async () => {
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) {
                console.warn("Error closing session:", e);
            }
            sessionPromiseRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
           audioContextRef.current.close();
           audioContextRef.current = null;
        }
        setIsRecording(false);
    }, []);

    useEffect(() => {
        return () => {
            handleStopRecording();
        };
    }, [handleStopRecording]);

    const handleStartRecording = useCallback(async () => {
        setIsRecording(true);
        setError(null);
        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                callbacks: {
                    onopen: () => {
                        if (!streamRef.current) return;
                        
                        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
                        const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };

                        source.connect(scriptProcessor);
                        scriptProcessor.connect(audioContextRef.current.destination);
                    },
                    onmessage: (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            if (briefRef.current) {
                                briefRef.current.innerText += text;
                            }
                        }
                        // Audio output is ignored as it is not required for the transcription feature.
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setError('Hiba történt a hangfelvétel közben.');
                        handleStopRecording();
                    },
                    onclose: (e: CloseEvent) => {
                        console.debug('Live session closed.');
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                },
            });
        } catch (err) {
            console.error('Failed to start recording:', err);
            setError('Nem sikerült elindítani a hangfelvételt. Engedélyezze a mikrofon használatát a böngészőben.');
            setIsRecording(false);
        }
    }, [handleStopRecording]);

    const toggleRecording = () => {
        if (isRecording) {
            handleStopRecording();
        } else {
            handleStartRecording();
        }
    };


    const handleGenerate = async () => {
        if (!briefRef.current || !briefRef.current.innerText.trim()) {
            setError('Kérjük, adja meg a projekt leírását.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const briefText = briefRef.current.innerText;

            const schema = {
                type: Type.OBJECT,
                properties: {
                    packageId: { type: Type.STRING, enum: Object.values(PackageId), description: "A legmegfelelőbb alapcsomag azonosítója." },
                    quoteDetails: {
                        type: Type.OBJECT,
                        properties: {
                            clientName: { type: Type.STRING, description: "Az ügyfél neve, ha szerepel a briefben." },
                            clientEmail: { type: Type.STRING, description: "Az ügyfél email címe, ha szerepel a briefben." },
                            quoteId: { type: Type.STRING, description: `Az ajánlat azonosítója. Formátum: ${new Date().getFullYear()}-DEV-XXX, ahol XXX egy háromjegyű szám.` },
                            subject: { type: Type.STRING, description: "Az ajánlat tárgya, pl. 'Weboldal fejlesztés'." },
                            estimatedTime: { type: Type.STRING, description: "A becsült megvalósítási idő, pl. '15-20 munkanap'." },
                        },
                        required: ['subject', 'estimatedTime']
                    },
                    extras: {
                        type: Type.ARRAY,
                        description: "A szükséges extra funkciók listája.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING, description: "Az extra egyedi azonosítója." },
                                customPrice: { type: Type.NUMBER, description: "Becsült vagy végleges ár, ha az extra típusa 'FROM' vagy 'HOURLY'." }
                            },
                            required: ['id']
                        }
                    },
                    pages: {
                        type: Type.ARRAY,
                        description: "A szükséges egyedi oldalak listája. Minden oldal egy 'oldalak' kategóriájú extra példánya.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                extraId: { type: Type.STRING, description: "Annak az 'oldalak' kategóriájú extrának az azonosítója, amelyikből ez a példány készül (pl. 'szolgaltatas-aloldal')." },
                                name: { type: Type.STRING, description: "Az oldal neve." },
                                description: { type: Type.STRING, description: "Az oldal rövid leírása." },
                                price: { type: Type.NUMBER, description: "Az oldal fejlesztésének ára." }
                            },
                            required: ['extraId', 'name', 'price']
                        }
                    },
                    landingSections: {
                        type: Type.ARRAY,
                        description: "Ha a 'landing' csomagot választottad, itt listázd a szükséges szekciókat.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "A szekció neve." },
                                price: { type: Type.NUMBER, description: "A szekció fejlesztésének ára." }
                            },
                            required: ['name', 'price']
                        }
                    },
                    customAdditions: {
                        type: Type.ARRAY,
                        description: "A briefben szereplő, de az 'EXTRAS' listában nem található egyedi funkciók vagy oldalak. Az AI-nak kell ezeket felismernie, áraznia és kategorizálnia.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "Az egyedi funkció neve." },
                                description: { type: Type.STRING, description: "Az egyedi funkció rövid leírása." },
                                price: { type: Type.NUMBER, description: "Az egyedi funkció becsült ára." },
                                category: { type: Type.STRING, enum: ['oldalak', 'webshop', 'altalanos'], description: "A legmegfelelőbb kategória." }
                            },
                            required: ['name', 'description', 'price', 'category']
                        }
                    }
                },
                required: ['packageId', 'quoteDetails']
            };
            
            const packagesInfo = BASE_PACKAGES
                .filter(p => p.id !== PackageId.MAINTENANCE)
                .map(p => `ID: ${p.id}, Név: ${p.name}, Ár: ${p.price} Ft, Leírás: ${p.description}`).join('\n');
            const extrasInfo = EXTRAS.map(e => `ID: ${e.id}, Név: ${e.name}, Kategória: ${e.category}, Típus: ${e.type}, Alapár: ${e.price} Ft, Leírás: ${e.description || ''}`).join('\n');

            const prompt = `
Feladat: Elemezz egy webfejlesztési projektleírást (brief) és állíts össze egy teljes árajánlatot a megadott csomagok és extrák felhasználásával. Az eredményt JSON formátumban add vissza a megadott séma szerint.

Rendelkezésre álló csomagok:
${packagesInfo}

Rendelkezésre álló extrák és oldalak:
${extrasInfo}

Ártípusok magyarázata:
- FIXED: Fix áras tétel.
- FROM: Az alapár egy kiindulási pont, ettől el lehet térni. Adj meg egy becsült 'customPrice'-t.
- HOURLY: Óradíjas tétel. Adj meg egy becsült 'customPrice'-t az óradíj és a becsült munkaóra alapján. (Óradíj: ${HOURLY_RATE} Ft)
- CUSTOM: Teljesen egyedi árazású, ne vedd figlebve az automatikus generálásnál.
- FREE: Ingyenes tétel.

Instrukciók:
1. Olvasd el a briefet, és válaszd ki a legmegfelelőbb alapcsomagot ('packageId').
2. Töltsd ki az ajánlat részleteit ('quoteDetails'). A 'quoteId' végén a számot találomra generáld.
3. Válaszd ki a szükséges extrákat ('extras'). A 'landing' csomaghoz ne adj 'oldalak' kategóriájú extrát, helyette a 'landingSections' mezőt használd.
4. Ha egy extra 'FROM' vagy 'HOURLY' típusú, becsüld meg a 'customPrice'-t a brief alapján.
5. Az 'oldalak' kategóriájú extrákból hozz létre annyi példányt, amennyi szükséges a 'pages' listában. Minden példánynak adj nevet, leírást és árat.
6. Ha a 'landing' csomagot választottad, a 'landingSections' listában sorold fel a szükséges szekciókat névvel és becsült árral.
7. FONTOS: Ha a briefben olyan funkciót vagy oldalt találsz, ami NEM SZEREPEL a rendelkezésre álló extrák listájában, akkor azt kezeld 'egyedi tételként'. Hozz létre neki egy bejegyzést a 'customAdditions' listában. Adj neki egy találó nevet, rövid leírást, becsült árat és sorold be a legmegfelelőbb kategóriába ('oldalak', 'webshop', 'altalanos').

Brief:
---
${briefText}
---
`;

            const response = await ai.models.generateContent({
                model: 'gemini-3.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: schema,
                }
            });

            const jsonString = response.text.trim();
            const result = JSON.parse(jsonString) as AIQuoteResponse;

            onGenerate(result);
            setIsOpen(false);

        } catch (err) {
            console.error(err);
            setError('Hiba történt az AI-ajánlat generálása közben. Kérjük, próbálja újra.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="mb-8 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    <MagicWandIcon />
                    <span className="text-xl font-bold text-slate-100">AI Asszisztens</span>
                    <span className="text-xs bg-indigo-500/20 text-indigo-400 font-semibold px-2 py-0.5 rounded-full">BÉTA</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">{isOpen ? 'Elrejtés' : 'Megnyitás'}</span>
                    <ChevronDownIcon className={`w-6 h-6 transform transition-transform text-slate-400 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-slate-700 space-y-4">
                    <p className="text-slate-400 text-sm">
                        Másolja be a projekt leírását (brief), vagy diktálja be a mikrofon ikonra kattintva, és az AI megpróbálja automatikusan összeállítani az árajánlatot.
                    </p>
                    <div className="relative">
                        <div
                            ref={briefRef}
                            contentEditable
                            className="w-full min-h-[150px] p-3 pr-14 rounded-md bg-slate-900 border border-slate-600 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none whitespace-pre-wrap"
                            data-placeholder="Pl. 'Szeretnék egy webshopot kézműves termékeknek, blog funkcióval és hírlevél feliratkozással...'"
                        />
                         <button
                            onClick={toggleRecording}
                            className={`absolute bottom-3 right-3 p-2 rounded-full text-slate-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 ${
                                isRecording 
                                ? 'bg-red-900/50 hover:bg-red-800/50 animate-pulse' 
                                : 'bg-slate-700 hover:bg-slate-600'
                            }`}
                            title={isRecording ? 'Felvétel leállítása' : 'Felvétel indítása mikrofonnal'}
                            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                        >
                            {isRecording ? <StopIcon /> : <MicrophoneIcon />}
                        </button>
                    </div>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 hover:-translate-y-0.5"
                    >
                        {isLoading ? (
                            <>
                                <LoaderIcon />
                                Generálás folyamatban...
                            </>
                        ) : (
                            <>
                                <MagicWandIcon />
                                Ajánlat generálása
                            </>
                        )}
                    </button>
                </div>
            )}
        </section>
    );
};

export default AIBriefProcessor;
