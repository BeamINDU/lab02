"use client";

import React, { useState } from 'react';
import InputModal from '../../components/modal/SampleInputModal';

export default function SettingPreferencePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleFormSubmit = (value: string) => {
        alert(`Hello, ${value}!`);
    };

    return (
        <div className="p-5">
            <h1 className="text-2xl font-semibold mb-4">Input Modal Example</h1>
            <button
                onClick={handleOpenModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            >
                Open Input Modal
            </button>

            <InputModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleFormSubmit} />
        </div>
    );
}
