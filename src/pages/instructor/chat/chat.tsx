import { useState } from 'react';
import Messages from './messages';

export default function ChatInterface() {
    const [activeTab, setActiveTab] = useState("Messages");


    return (
        <>
            <div className="flex space-x-2 p-2">
                {["Messages", "Assignment", "Announcements"].map((tab) => (
                    <button
                        key={tab}
                        className={`px-4 py-2 text-[15px] font-medium font-['Archivo'] rounded-[35px] shadow-[0px_1px_1.600000023841858px_0px_rgba(0,0,0,0.25)] border border-primary ${activeTab === tab
                            ? "bg-primary text-white"
                            : "text-gray-600 border border-primary border-b-0"
                            }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            {activeTab == 'Messages' &&
                <Messages />
            }

            {activeTab == 'Assignment' &&
                <Messages />
            }

            {activeTab == 'Announcements' &&
                <Messages />
            }
        </>
    );
}