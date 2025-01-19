"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'

interface Event {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  type: string
  capacity: number
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link href="/dashboard/events/create">
          <Button>Create New Event</Button>
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>{event.name}</CardTitle>
              <CardDescription>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{event.description}</p>
              <p className="mt-2 text-sm font-semibold">Capacity: {event.capacity}</p>
              <p className="text-sm font-semibold">Type: {event.type}</p>
            </CardContent>
            <CardFooter>
              <Link href={`/dashboard/events/${event.id}`}>
                <Button variant="outline">View Details</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

