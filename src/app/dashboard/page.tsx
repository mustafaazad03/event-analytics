"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/auth-context'

export default function DashboardPage() {
  const [events, setEvents] = useState([])
  const { user } = useAuth() as { user: { token: string } }

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/events', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setEvents(data)
        } else {
          console.error('Failed to fetch events')
        }
      } catch (error) {
        console.error('Error fetching events:', error)
      }
    }

    if (user) {
      fetchEvents()
    }
  }, [user])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Events</CardTitle>
          <CardDescription>Number of events you've created</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{events.length}</p>
        </CardContent>
      </Card>
    </div>
  )
}

