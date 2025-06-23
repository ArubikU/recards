"use client";
import { motion } from 'framer-motion';

export default function ShortCards({cards}: {cards: any[]}) {
    return (
        <>
            {cards.length > 0 ? (
                <div className="space-y-4">
                    {cards.slice(0, 3).map((card) => (
                        <motion.div 
                            key={card.id} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 0.3 }} 
                            className="bg-orange-50 rounded-xl p-4"
                        >
                            <p className="font-medium">{card.front}</p>
                            <p className="text-sm text-ink mt-1">{card.back.substring(0, 100)}...</p>
                        </motion.div>
                    ))}
                    {cards.length > 3 && <p className="text-sm text-center text-irisdark">+{cards.length - 3} más</p>}
                </div>
            ) : (
                <p className="text-center text-sm text-ink">No hay flashcards aún.</p>
            )}
        </>
    );
}