"use client";
import { Quiz, Room } from '@/lib/types';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface SampleProps {
    quizzes: Quiz[];
    room: Room;
}

export default function ShortQuizzis({ quizzes, room }: SampleProps) {
    return (
        <>
            {quizzes.length > 0 ? (
                <div className="space-y-4">
                    {quizzes.map((quiz) => (
                        <motion.div
                            key={quiz.id}
                            whileHover={{ scale: 1.02 }}
                            className="bg-ivory rounded-xl border hover:border-irisdark p-4 cursor-pointer"
                        >
                            <Link href={`/rooms/${room.id}/quizzes/${quiz.id}`}>
                                <div>
                                    <h3 className="font-semibold text-lg text-iris">{quiz.title}</h3>
                                    <p className="text-sm text-ink mt-1">
                                        {quiz.description?.substring(0, 100)}...
                                    </p>
                                    {quiz.difficulty && (
                                        <div className="mt-2 flex items-center">
                                            <span className="text-xs text-ink mr-2">Dificultad:</span>
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i}
                                                    className={`w-2 h-2 rounded-full mx-0.5 ${
                                                        i < quiz.difficulty ? 'bg-iris' : 'bg-gray-200'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-sm text-ink">No hay quizzes aún.</p>
            )}
        </>
    );
}