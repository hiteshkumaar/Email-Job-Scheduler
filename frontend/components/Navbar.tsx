'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold text-blue-600">EmailScheduler</span>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {session && (
                                <>
                                    <Link href="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        Dashboard
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center">
                        {session ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-700">{session.user?.name}</span>
                                {session.user?.image && (
                                    <img className="h-8 w-8 rounded-full" src={session.user.image} alt="" />
                                )}
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="text-sm text-red-600 hover:text-red-900"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link href="/" className="text-blue-600 hover:text-blue-900 font-medium">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
