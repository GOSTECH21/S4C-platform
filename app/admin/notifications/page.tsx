"use client";

import { useEffect, useState } from "react";
import AppLayout from "../../layout/AppLayout";
import { getNotifications } from "../../services/notifications.service";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  async function loadNotifications() {
    const data = await getNotifications();
    setNotifications(data || []);
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-5xl font-bold text-green-400">Notifications</h1>
          <p className="mt-3 text-slate-300">
            Live alerts created by sponsored match events.
          </p>
        </div>

        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="rounded-xl border border-slate-800 bg-slate-900 p-6"
          >
            <h2 className="text-2xl font-bold">{notification.title}</h2>

            <p className="mt-2 text-slate-300">{notification.message}</p>

            <p className="mt-3 text-sm text-slate-400">
              Club: {notification.clubs?.name}
            </p>

            <p className="text-sm text-slate-400">
              Fixture: {notification.fixtures?.home_club?.name} vs{" "}
              {notification.fixtures?.away_club?.name}
            </p>

            <p className="mt-3 text-green-400">{notification.status}</p>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}