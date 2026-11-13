import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, History, CheckCircle2, Calendar, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export default function AgentHistory() {
  const navigate = useNavigate();

  const pastRides = [
    {
      id: 'ride-01',
      studentName: 'Ananya Joshi',
      pickup: 'Ratnagiri Bus Stand',
      destination: 'Govt Polytechnic Hostel',
      date: 'Yesterday, 5:30 PM',
      status: 'completed',
    },
    {
      id: 'ride-02',
      studentName: 'Rahul Naik',
      pickup: 'Chiplun Market Junction',
      destination: 'Commerce College Library',
      date: '10 Nov 2024, 8:15 AM',
      status: 'completed',
    },
  ];

  return (
    <div className="container max-w-3xl py-8 px-4">
      <Button
        variant="ghost"
        className="mb-4 pl-0 hover:bg-transparent"
        onClick={() => navigate('/agent/dashboard')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trip & Service History</h1>
          <p className="text-sm text-muted-foreground">
            Log of previously accepted and completed alternative student transport journeys
          </p>
        </div>

        <div className="space-y-3">
          {pastRides.map((ride) => (
            <Card key={ride.id} className="shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{ride.studentName}</span>
                    <Badge variant="outline" className="text-xs text-emerald-600 bg-emerald-50">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                    {ride.pickup} → {ride.destination}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                    {ride.date}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

