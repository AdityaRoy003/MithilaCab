'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, Timestamp } from "firebase/firestore";
import AppLayout from "@/components/app-layout";
import { RideHistoryItem } from "@/components/ride/ride-history-item";
import type { Ride } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Filter, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';


type RideStatusFilter = 'all' | 'upcoming' | 'completed' | 'cancelled';

export default function HistoryPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [statusFilter, setStatusFilter] = useState<RideStatusFilter>('all');

  // State for new filters
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [locationFilter, setLocationFilter] = useState('');
  const [fareRange, setFareRange] = useState([0, 5000]);

  const ridesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
        collection(firestore, 'rides'), 
        where('userId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: rides, isLoading: areRidesLoading } = useCollection<Ride>(ridesQuery);
  const isLoading = isUserLoading || (user && areRidesLoading);

  const filteredRides = useMemo(() => {
      if (!rides) return [];

      let filtered = [...rides];

      // Status filter
      if (statusFilter === 'upcoming') {
        filtered = filtered.filter(ride => ['requested', 'accepted', 'in-progress'].includes(ride.status || ''));
      } else if (statusFilter !== 'all') {
        filtered = filtered.filter(ride => ride.status === statusFilter);
      }

      // Date range filter
      if (dateRange?.from) {
        filtered = filtered.filter(ride => {
          const rideDate = ride.startTime instanceof Timestamp ? ride.startTime.toDate() : new Date(ride.startTime);
          return rideDate ? rideDate >= dateRange.from! : false;
        });
      }
      if (dateRange?.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999); // Include the whole day
        filtered = filtered.filter(ride => {
            const rideDate = ride.startTime instanceof Timestamp ? ride.startTime.toDate() : new Date(ride.startTime);
            return rideDate ? rideDate <= toDate : false;
        });
      }

      // Location filter
      if (locationFilter) {
          const lowerCaseFilter = locationFilter.toLowerCase();
          filtered = filtered.filter(ride => 
              ride.pickupLocation.toLowerCase().includes(lowerCaseFilter) || 
              ride.destinationLocation.toLowerCase().includes(lowerCaseFilter)
          );
      }

      // Fare range filter
      filtered = filtered.filter(ride => ride.fareAmount >= fareRange[0] && ride.fareAmount <= fareRange[1]);

      // Sort
      return filtered.sort((a, b) => {
        const timeA = a.startTime?.toDate ? a.startTime.toDate().getTime() : 0;
        const timeB = b.startTime?.toDate ? b.startTime.toDate().getTime() : 0;
        return timeB - timeA;
      });
  }, [rides, statusFilter, dateRange, locationFilter, fareRange]);

  const resetFilters = () => {
    setDateRange(undefined);
    setLocationFilter('');
    setFareRange([0, 5000]);
  }

  const renderContent = () => {
      if (isLoading) {
        return (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </>
        );
      }

      if (user && filteredRides && filteredRides.length > 0) {
        return filteredRides.map((ride) => (
          <RideHistoryItem key={ride.id} ride={ride} />
        ));
      }
      
      if (user && (!filteredRides || filteredRides.length === 0)) {
          return (
              <div className="text-center py-10">
              <h3 className="text-xl font-semibold">No rides found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or check back later.</p>
            </div>
          );
      }

      if (!user && !isLoading) {
         return (
            <div className="text-center py-10">
              <h3 className="text-xl font-semibold">Please log in</h3>
              <p className="text-muted-foreground">You need to be logged in to see your ride history.</p>
            </div>
         );
      }

      return null;
  }

  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
        <div className="mb-6">
            <Button variant="ghost" onClick={() => router.push('/profile')} className="-ml-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profile
            </Button>
        </div>
        <h1 className="font-headline text-3xl font-bold mb-6">Ride History</h1>
        
        <Collapsible className="mb-6">
            <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter Rides
                    </Button>
                </CollapsibleTrigger>
                <Button variant="ghost" onClick={resetFilters} className="text-sm">Reset Filters</Button>
            </div>
            <CollapsibleContent className="pt-4">
                <div className="p-4 border rounded-lg space-y-6 bg-card text-card-foreground shadow-sm">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="date-range">Date Range</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date-range"
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !dateRange && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                                    {format(dateRange.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date range</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input 
                                id="location" 
                                placeholder="Search pickup or destination" 
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>Fare Range</Label>
                            <span className="text-sm font-medium text-muted-foreground">₹{fareRange[0]} - ₹{fareRange[1]}</span>
                        </div>
                        <Slider
                            defaultValue={[0, 5000]}
                            max={5000}
                            step={100}
                            value={fareRange}
                            onValueChange={setFareRange}
                        />
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
        
        <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as RideStatusFilter)}>
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            <TabsContent value={statusFilter} className="mt-6">
                <div className="space-y-4">
                    {renderContent()}
                </div>
            </TabsContent>
        </Tabs>
      </main>
    </AppLayout>
  );
}
