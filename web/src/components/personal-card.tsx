import React, { useEffect, useState } from "react";
import sgProfile from '@/src/assets/sg.jpeg'
import { X } from "lucide-react";
const PersonCard = ({ handleClose }: { handleClose: () => void }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div
                className="cursor-pointer relative w-48 bg-white dark:bg-gray-800 rounded-lg shadow-md p-1 flex flex-col items-center space-y-1 hover:shadow-lg transition-shadow"
                onClick={() => setOpen(true)}
            >
                <img
                    src={sgProfile}
                    className="rounded-lg w-full h-48 object-cover"
                    alt="Solomon Kamara"

                />
                <button
                    onClick={handleClose}
                    className="absolute -top-2 -right-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg"
                >
                    <X size={17} />
                </button>
                <div>
                    <h3 className="text-text-primary dark:text-white font-semibold">General Secretary</h3>
                    <p className="italic text-gray-500">Solomon Kamara</p>
                </div>
            </div>
        </>
    );
};

export { PersonCard };


const SHOW_DURATION = 60000; // 60 seconds
const MIN_DELAY = 120000; // 2 minutes
const MAX_DELAY = 180000; // 3 minutes

const FloatingPersonCard = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const lastHiddenTime = localStorage.getItem("popup_last_hidden");
        const now = Date.now();

        if (!lastHiddenTime) {
            startShowCycle();
            return;
        }

        const lastHide = parseInt(lastHiddenTime, 10);
        const timePassed = now - lastHide;

        if (timePassed >= MIN_DELAY) {
            startShowCycle();
        } else {
            const remaining = MIN_DELAY - timePassed;

            const timer = setTimeout(() => {
                startShowCycle();
            }, remaining);

            return () => clearTimeout(timer);
        }
    }, []);

    const startShowCycle = () => {
        setVisible(true);

        const hideTimer = setTimeout(() => {
            hideAndScheduleNext();
        }, SHOW_DURATION);

        return () => clearTimeout(hideTimer);
    };

    const hideAndScheduleNext = () => {
        setVisible(false);
        localStorage.setItem("popup_last_hidden", Date.now().toString());

        const randomDelay =
            Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY)) + MIN_DELAY;

        setTimeout(() => {
            startShowCycle();
        }, randomDelay);
    };

    // Manual close button
    const handleClose = () => {
        hideAndScheduleNext();
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">


            <PersonCard handleClose={handleClose} />
        </div>
    );
};

export default FloatingPersonCard;

