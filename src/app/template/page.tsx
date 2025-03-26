"use client";

import { useState } from "react";
import { Switch } from "@headlessui/react";

// TemplateList Component
const TemplateList = ({ templates, selectedTemplate, setSelectedTemplate, onAddClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border">
      <div className="flex justify-between items-center mb-2 bg-blue-900 text-white p-2 rounded-t-lg">
        <h2 className="text-lg font-semibold">Template</h2>
        <button
          onClick={onAddClick}
          className="bg-white text-blue-900 px-3 py-1 rounded-lg text-sm font-semibold shadow-md hover:bg-gray-200"
        >
          +Add
        </button>
      </div>
      <ul className="mt-2">
        {templates?.map((template) => (
          <li
            key={template}
            className={`p-2 cursor-pointer ${selectedTemplate === template ? "bg-blue-100 border-r-8 border-blue-600" : "border-transparent hover:bg-gray-200"}`}
            onClick={() => setSelectedTemplate(template)}
            title={template}
          >
            <span className="truncate block whitespace-nowrap overflow-hidden">{template}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// TemplateDetail Component
const TemplateDetail = ({ selectedTemplate, serviceType, setServiceType, scheduleEnabled, setScheduleEnabled, messages, setMessages }) => {
  return (
    <div className="col-span-2 bg-white rounded-lg shadow-md border">
      <div className="bg-blue-900 text-white p-2 rounded-t-lg">
        <h2 className="text-lg font-semibold">Detail</h2>
      </div>
      <div className="grid grid-cols-2 p-4 gap-4">
        <DetailSection selectedTemplate={selectedTemplate} serviceType={serviceType} setServiceType={setServiceType} scheduleEnabled={scheduleEnabled} setScheduleEnabled={setScheduleEnabled} />
        <MessagesSection messages={messages} setMessages={setMessages} />
      </div>
    </div>
  );
};

// DetailSection Component
const DetailSection = ({ selectedTemplate, serviceType, setServiceType, scheduleEnabled, setScheduleEnabled }) => {
  return (
    <div>
      <label className="block font-semibold">Template Name:</label>
      <input className="w-full p-2 border rounded-lg" value={selectedTemplate} readOnly />

      <label className="block font-semibold mt-4">Target System:</label>
      <input className="w-full p-2 border rounded-lg" value="ERP Accounting" readOnly />

      <label className="block font-semibold mt-4">Service Type:</label>
      <div className="flex space-x-4">
        <label>
          <input
            type="radio"
            name="serviceType"
            checked={serviceType === "API"}
            onChange={() => setServiceType("API")}
            className="mr-2"
          />
          API
        </label>
        <label>
          <input
            type="radio"
            name="serviceType"
            checked={serviceType === "FTP"}
            onChange={() => setServiceType("FTP")}
            className="mr-2"
          />
          FTP
        </label>
      </div>

      <label className="block font-semibold mt-4">URL:</label>
      <input className="w-full p-2 border rounded-lg" placeholder="Enter URL" />

      <div className="flex items-center space-x-4 mt-4">
        <label className="font-semibold">Set Schedule</label>
        <Switch
          checked={scheduleEnabled}
          onChange={setScheduleEnabled}
          className={`${scheduleEnabled ? "bg-blue-600" : "bg-gray-400"} relative inline-flex h-6 w-11 items-center rounded-full`}
        >
          <span className="sr-only">Enable schedule</span>
          <span className={`${scheduleEnabled ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform bg-white rounded-full`} />
        </Switch>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block">Occurs Date:</label>
          <input type="date" className="p-2 border rounded-lg w-full" defaultValue="2025-01-01" disabled={!scheduleEnabled} />
        </div>
        <div>
          <label className="block">Occurs Time:</label>
          <input type="time" className="p-2 border rounded-lg w-full" defaultValue="12:00:00" disabled={!scheduleEnabled} />
        </div>
      </div>
    </div>
  );
};

// MessagesSection Component
const MessagesSection = ({ messages, setMessages }) => {
  return (
    <div className="border-l pl-4">
      <h2 className="text-lg font-semibold">Messages</h2>
      <div className="mt-4 space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={msg.checked}
              onChange={() => {
                setMessages((prev) =>
                  prev.map((m) => (m.id === msg.id ? { ...m, checked: !m.checked } : m))
                );
              }}
            />
            <label className="text-gray-700 whitespace-nowrap font-semibold">Message #{msg.id}:</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              value={msg.text}
              onChange={(e) => {
                setMessages((prev) =>
                  prev.map((m) => (m.id === msg.id ? { ...m, text: e.target.value } : m))
                );
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-4">
        <button className="bg-white text-black font-bold border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100">
          Preview
        </button>
      </div>
    </div>
  );
};

// Main TemplateConfig Component
export default function TemplateConfig() {
  const [template, setTemplate] = useState([
    "invoice AAA Company",
    "Book KPI",
    "MOM customer XYZ co., th.",
    "template1 template2 template3 template4 template5 template6 template7 template8 template9 template10 template11",
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState("invoice AAA Company");
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [messages, setMessages] = useState([
    { id: 1, text: "", checked: true },
    { id: 2, text: "", checked: true },
    { id: 3, text: "", checked: true },
    { id: 4, text: "", checked: true },
    { id: 5, text: "", checked: false },
    { id: 6, text: "", checked: false },
    { id: 7, text: "", checked: true },
    { id: 8, text: "", checked: false },
  ]);
  const [serviceType, setServiceType] = useState("API");
  const [isAdding, setIsAdding] = useState(false); // Track the state for the "Add" action
  const [newTemplate, setNewTemplate] = useState(""); // Track the new template input value

  const handleAddClick = () => {
    setIsAdding(true); // Show the input for adding a new template
  };

  const handleTemplateAdd = () => {
    if (newTemplate.trim()) {
      setTemplate((prev) => [...prev, newTemplate]);
      setNewTemplate(""); // Clear the input after adding
      setIsAdding(false); // Hide the input
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {!isAdding && (
        <TemplateList
          templates={template}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          onAddClick={handleAddClick}
        />
      )}

      {/* {isAdding && (
        <div className="bg-white rounded-lg shadow-md border col-span-3 p-4">
          <label className="block font-semibold">New Template Name:</label>
          <input
            className="w-full p-2 border rounded-lg"
            value={newTemplate}
            onChange={(e) => setNewTemplate(e.target.value)}
            placeholder="Enter template name"
          />
          <button
            onClick={handleTemplateAdd}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Add Template
          </button>
        </div>
      )} */}

      <TemplateDetail
        selectedTemplate={selectedTemplate}
        serviceType={serviceType}
        setServiceType={setServiceType}
        scheduleEnabled={scheduleEnabled}
        setScheduleEnabled={setScheduleEnabled}
        messages={messages}
        setMessages={setMessages}
      />
    </div>
  );
}
