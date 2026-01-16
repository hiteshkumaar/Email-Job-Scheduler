'use client';

import { useState } from 'react';
import { scheduleEmail } from '@/lib/api';
import { X } from 'lucide-react';

interface ComposeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ComposeModal({ isOpen, onClose, onSuccess }: ComposeModalProps) {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [startTime, setStartTime] = useState('');
    const [delay, setDelay] = useState(0);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('subject', subject);
            formData.append('body', body);
            if (file) formData.append('file', file);
            if (startTime) formData.append('startTime', new Date(startTime).toISOString());
            formData.append('delayBetweenEmails', delay.toString());

            await scheduleEmail(formData);
            onSuccess();
            onClose();
            // Reset form
            setSubject('');
            setBody('');
            setFile(null);
        } catch (error) {
            console.error(error);
            alert('Failed to schedule emails');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full m-4">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-medium">Compose New Email</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Subject</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Body</label>
                        <textarea
                            required
                            rows={4}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Recipients (CSV)</label>
                        <input
                            type="file"
                            accept=".csv,.txt"
                            required
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                        <p className="text-xs text-gray-500 mt-1">Upload a CSV with an 'email' column.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Time</label>
                            <input
                                type="datetime-local"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Delay (seconds)</label>
                            <input
                                type="number"
                                min="0"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={delay}
                                onChange={(e) => setDelay(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-blue-300"
                        >
                            {loading ? 'Scheduling...' : 'Schedule'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
