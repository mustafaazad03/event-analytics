"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAuth } from '@/context/auth-context'

interface EventAnalytics {
  totalParticipants: number
  sessions: {
    id: string
    name: string
    interactionCount: number
    uniqueParticipants: number
    averageSentiment: number
  }[]
  overallEngagement: number
}

export default function AnalyticsPage() {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null)
  const { user } = useAuth() as {user: { token: string }}

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
          if (data.length > 0) {
            setSelectedEvent(data[0].id)
          }
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

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!selectedEvent) return

      try {
        const response = await fetch(`http://localhost:3000/api/analytics/events/${selectedEvent}/dashboard`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data)
        } else {
          console.error('Failed to fetch analytics')
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      }
    }

    if (user && selectedEvent) {
      fetchAnalytics()
    }
  }, [user, selectedEvent])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <Select onValueChange={setSelectedEvent} value={selectedEvent}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select an event" />
          </SelectTrigger>
          <SelectContent>
            {events.map((event: any) => (
              <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {analytics && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{analytics.totalParticipants}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Overall Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{analytics.overallEngagement.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{analytics.sessions.length}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {analytics && analytics.sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Session Analytics</CardTitle>
            <CardDescription>Interaction count and unique participants per session</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.sessions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="interactionCount" stroke="#8884d8" name="Interaction Count" />
                <Line yAxisId="right" type="monotone" dataKey="uniqueParticipants" stroke="#82ca9d" name="Unique Participants" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

