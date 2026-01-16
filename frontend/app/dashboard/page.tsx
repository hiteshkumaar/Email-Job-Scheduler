'use client';

import { useState, useEffect } from 'react';
import { getScheduledEmails, getSentEmails } from '@/lib/api';
import ComposeModal from '@/components/ComposeModal';
import { Mail, Clock, Send, Plus } from 'lucide-react';
import clsx from 'clsx';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<'scheduled' | 'sent'>('scheduled');
    const [emails, setEmails] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isComposeOpen, setIsComposeOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = activeTab === 'scheduled' ? await getScheduledEmails() : await getSentEmails();
            setEmails(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <button
                    onClick={() => setIsComposeOpen(true)}
                    className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Compose New Email
                </button>
            </div>

            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('scheduled')}
                        className={clsx(
                            activeTab === 'scheduled'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center'
                        )}
                    >
                        <Clock className="mr-2 h-4 w-4" />
                        Scheduled Emails
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={clsx(
                            activeTab === 'sent'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center'
                        )}
                    >
                        <Send className="mr-2 h-4 w-4" />
                        Sent Emails
                    </button>
                </nav>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : emails.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <Mail className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No emails found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {activeTab === 'scheduled' ? "You haven't scheduled any emails yet." : "No emails have been sent yet."}
                    </p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <ul className="divide-y divide-gray-200">
                        {emails.map((email) => (
                            <li key={email.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-blue-600 truncate">{email.subject}</div>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <span className={clsx(
                                            "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                                            email.status === 'SENT' ? "bg-green-100 text-green-800" :
                                                email.status === 'FAILED' ? "bg-red-100 text-red-800" :
                                                    "bg-yellow-100 text-yellow-800"
                                        )}>
                                            {email.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500">
                                            <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                            {email.recipient}
                                        </p>
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                        <p>
                                            {activeTab === 'scheduled'
                                                ? `Scheduled for ${new Date(email.scheduledAt).toLocaleString()}`
                                                : `Sent at ${new Date(email.sentAt).toLocaleString()}`
                                            }
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <ComposeModal
                isOpen={isComposeOpen}
                onClose={() => setIsComposeOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    );
}
