import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

export const FAQSection = () => {
    const faqs = [
        {
            question: '¿Qué es Cyber Arena Open?',
            answer: 'Cyber Arena Open es una competencia de videojuegos que se llevará a cabo durante la temporada de Navidad. Los participantes podrán competir en cinco juegos diferentes, ya sea formando equipos o participando individualmente.',
        },
        {
            question: '¿Cómo puedo inscribirme?',
            answer: 'Puedes inscribirte haciendo clic en el botón "Inscribirme" en la página principal y seleccionando el juego en el que deseas competir. Luego completa el formulario de registro con tus datos.',
        },
        {
            question: '¿Puedo participar en más de un juego?',
            answer: 'Sí, puedes inscribirte en múltiples juegos. Cada juego tendrá su propio proceso de inscripción y calendario de competencias.',
        },
        {
            question: '¿Necesito tener un equipo para participar?',
            answer: 'Depende del juego. Algunos juegos permiten participación individual mientras que otros requieren formar equipos. Verifica los requisitos específicos de cada juego en la sección de inscripción.',
        },
        {
            question: '¿Cuándo comienza el torneo?',
            answer: 'El torneo comenzará durante la temporada de Navidad. Las fechas específicas de cada juego y ronda serán comunicadas después del cierre de inscripciones.',
        },
        {
            question: '¿Hay algún costo para participar?',
            answer: 'La información sobre costos de inscripción estará disponible en el proceso de registro. Contacta al equipo organizador para más detalles.',
        },
        {
            question: '¿Qué juegos están disponibles?',
            answer: 'Cyber Arena Open incluye cinco juegos diferentes para competir. Puedes ver todos los juegos disponibles en la sección "Juegos" de nuestra página principal.',
        },
        {
            question: '¿Qué pasa si tengo problemas técnicos durante la competencia?',
            answer: 'Habrá soporte técnico disponible durante todas las competencias. Si experimentas problemas, contacta inmediatamente al equipo de soporte a través de nuestros canales oficiales.',
        },
    ];

    return (
        <section id="faq" className="py-20 px-4 bg-background">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-12">
                    <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 glow-text">
                        Preguntas Frecuentes
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Encuentra respuestas a las preguntas más comunes sobre Cyber Arena Open
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border border-border rounded-lg px-6 bg-card/50 backdrop-blur-sm hover:bg-card transition-colors"
                        >
                            <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary transition-colors">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                <div className="mt-12 text-center">
                    <p className="text-muted-foreground mb-4">
                        ¿No encuentras la respuesta que buscas?
                    </p>
                    <a
                        href="#contactos"
                        className="text-primary hover:text-primary/80 font-semibold transition-colors inline-flex items-center gap-2"
                    >
                        Contáctanos
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
};
