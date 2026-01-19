"use client";

import { BellRing, CheckCheck, XCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const notifications = [
    {
        icon: <BellRing className="h-6 w-6 text-primary" />,
        title: "Driver Arrived",
        description: "Your driver, Ramesh Kumar, has arrived at your pickup location.",
        time: "1 min ago",
    },
    {
        icon: <CheckCheck className="h-6 w-6 text-green-500" />,
        title: "Ride Completed",
        description: "Your ride to Mithila University is complete. Total fare: ₹120.50.",
        time: "2 hours ago",
    },
    {
        icon: <XCircle className="h-6 w-6 text-destructive" />,
        title: "Ride Cancelled",
        description: "Your ride request was cancelled.",
        time: "1 day ago",
    },
     {
        icon: <BellRing className="h-6 w-6 text-primary" />,
        title: "OTP Verification",
        description: "Your OTP for login is 482910.",
        time: "2 days ago",
    },
];

export function NotificationsPanel() {
    return (
        <div className="py-4 flex flex-col h-full">
            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <BellRing className="h-12 w-12 mb-4" />
                    <h3 className="text-lg font-semibold">No New Notifications</h3>
                    <p className="text-sm">We'll let you know when there's something new.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {notifications.map((notification, index) => (
                        <div key={index} className="flex items-start gap-4">
                           <div className="bg-secondary p-3 rounded-full">
                             {notification.icon}
                           </div>
                           <div className="flex-1">
                                <p className="font-semibold">{notification.title}</p>
                                <p className="text-sm text-muted-foreground">{notification.description}</p>
                                <p className="text-xs text-muted-foreground/70 mt-1">{notification.time}</p>
                           </div>
                        </div>
                    ))}
                </div>
            )}
             <Button variant="outline" className="mt-auto">Clear All</Button>
        </div>
    );
}
