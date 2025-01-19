"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

export default function EventDetailPage() {
  const [event, setEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<string[]>([])
  const [newParticipant, setNewParticipant] = useState('')
  const { user } = useAuth() as { user: { token: string } }
  const params = useParams()
  const router = useRouter()
  const { eventId } = params

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/events/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setEvent(data)
          setParticipants(data.participants.map((p: any) => p.userId))
        } else {
          console.error('Failed to fetch event details')
        }
      } catch (error) {
        console.error('Error fetching event details:', error)
      }
    }

    if (user && eventId) {
      fetchEventDetails()
    }
  }, [user, eventId])

  const handleAddParticipant = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/events/${eventId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ userIds: [newParticipant] })
      })
      if (response.ok) {
        setParticipants([...participants, newParticipant])
        setNewParticipant('')
      } else {
        console.error('Failed to add participant')
      }
    } catch (error) {
      console.error('Error adding participant:', error)
    }
  }

  const handleDeleteEvent = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      if (response.ok) {
        router.push('/dashboard/events')
      } else {
        console.error('Failed to delete event')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  if (!event) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{event.name}</CardTitle>
        <CardDescription>
          {new Date(event.startDate).toLocaleString()} - {new Date(event.endDate).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>{event.description}</p>
        <p>Type: {event.type}</p>
        <p>Capacity: {event.capacity}</p>
        <div>
          <h3 className="text-lg font-semibold mb-2">Participants</h3>
          <ul className="list-disc list-inside">
            {participants.map((participant, index) => (
              <li key={index}>{participant}</li>
            ))}
          </ul>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="newParticipant" className="sr-only">
            Add Participant
          </Label>
          <Input
            id="newParticipant"
            placeholder="Participant ID"
            value={newParticipant}
            onChange={(e) => setNewParticipant(e.target.value)}
          />
          <Button onClick={handleAddParticipant}>Add</Button>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={() => router.push(`/dashboard/events/${eventId}/edit`)}>
          Edit Event
        </Button>
        <Button variant="destructive" onClick={handleDeleteEvent}>
          Delete Event
        </Button>
      </CardFooter>
    </Card>
  )
}

