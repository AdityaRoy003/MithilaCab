'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDriver, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { ArrowLeft, User, Car, FileText, Upload, Loader2, CheckCircle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function DriverProfilePage() {
    const { driver, isDriverLoading } = useDriver();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [vehicle, setVehicle] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (driver) {
            setName(driver.name || '');
            setPhone(driver.phone || '');
            setVehicle(driver.vehicle || '');
            setLicensePlate(driver.licensePlate || '');
        }
    }, [driver]);

    const handleSaveChanges = async () => {
        if (!driver) return;
        const driverDocRef = doc(firestore, 'drivers', driver.id);
        setIsSaving(true);
        try {
            const updatedProfileData = {
                name,
                phone,
                vehicle,
                licensePlate,
            };
            
            setDoc(driverDocRef, updatedProfileData, { merge: true })
                .catch(async (serverError) => {
                    const permissionError = new FirestorePermissionError({
                        path: driverDocRef.path,
                        operation: 'update',
                        requestResourceData: updatedProfileData,
                    });
                    errorEmitter.emit('permission-error', permissionError);
                });

            toast({
                title: "Profile Updated",
                description: "Your information has been saved successfully.",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Could not update profile.",
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleUpload = async (docType: 'license' | 'rc' | 'insurance' | 'pollution') => {
        if (!driver) return;

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const driverDocRef = doc(firestore, 'drivers', driver.id);
        const mockUrl = `https://picsum.photos/seed/${driver.id}-${docType}/800/500`;

        const updateData = {
            documents: {
                ...driver.documents,
                [docType]: mockUrl
            },
            isVerified: false // Ensure verification is pending after a new upload
        };
        
        setDoc(driverDocRef, updateData, { merge: true })
            .catch(async (serverError) => {
                 const permissionError = new FirestorePermissionError({
                    path: driverDocRef.path,
                    operation: 'update',
                    requestResourceData: updateData,
                });
                errorEmitter.emit('permission-error', permissionError);
                 toast({ variant: 'destructive', title: "Upload Failed", description: 'You do not have permission to perform this action.'})
            });
        
        toast({ title: "Upload Successful!", description: `${docType.charAt(0).toUpperCase() + docType.slice(1)} has been submitted for verification.` });
    };

    if (isDriverLoading) {
        return (
            <AppLayout>
                <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
                     <Skeleton className="h-8 w-48 mb-6" />
                     <Skeleton className="h-[40rem] w-full" />
                </main>
            </AppLayout>
        )
    }

    if (!driver) {
        return (
             <AppLayout>
                <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 lg:p-8">
                     <p>Could not load driver profile.</p>
                     <Button onClick={() => router.push('/profile')}>Back to profile</Button>
                </main>
            </AppLayout>
        )
    };

    return (
        <AppLayout>
            <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => router.push('/profile')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Profile
                    </Button>
                </div>
                <h1 className="font-headline text-3xl font-bold mb-6">Personal & Vehicle Info</h1>
                <div className="max-w-4xl mx-auto w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Your Profile</CardTitle>
                            <CardDescription>Keep your personal and vehicle details up to date.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                             {/* Personal Info */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                     <Avatar className="h-20 w-20">
                                        <AvatarImage src={driver.image?.imageUrl} alt={driver.name} data-ai-hint={driver.image?.imageHint} />
                                        <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid gap-1.5 flex-1">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" type="email" value={driver.email || ''} disabled />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            
                            <Separator />
                            
                             {/* Vehicle Info */}
                            <div className="space-y-6">
                                <h3 className="font-semibold text-lg flex items-center gap-2"><Car /> Vehicle Details</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                     <div className="space-y-2">
                                        <Label htmlFor="vehicle">Vehicle Model</Label>
                                        <Input id="vehicle" placeholder="e.g., Suzuki Swift" value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="license-plate">License Plate</Label>
                                        <Input id="license-plate" placeholder="e.g., BR 01 AB 1234" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            
                            <Separator />

                            {/* Documents */}
                             <div className="space-y-6">
                                <h3 className="font-semibold text-lg flex items-center gap-2"><FileText /> Documents</h3>
                                <CardDescription>Upload your documents for verification. Once verified, you'll be able to start accepting rides.</CardDescription>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <DocumentUploadCard title="Driving License" onUpload={() => handleUpload('license')} uploadedUrl={driver.documents?.license} />
                                    <DocumentUploadCard title="Vehicle RC" onUpload={() => handleUpload('rc')} uploadedUrl={driver.documents?.rc} />
                                    <DocumentUploadCard title="Insurance" onUpload={() => handleUpload('insurance')} uploadedUrl={driver.documents?.insurance} />
                                    <DocumentUploadCard title="Pollution Certificate" onUpload={() => handleUpload('pollution')} uploadedUrl={driver.documents?.pollution} />
                                </div>
                             </div>

                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveChanges} disabled={isSaving} className="font-bold">
                                {isSaving ? 'Saving...' : 'Save All Changes'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </AppLayout>
    );
}

function DocumentUploadCard({ title, onUpload, uploadedUrl }: { title: string, onUpload: () => void, uploadedUrl?: string }) {
    const [isUploading, setIsUploading] = useState(false);

    const handleUploadClick = async () => {
        setIsUploading(true);
        await onUpload();
        setIsUploading(false);
    }

    return (
        <div className="p-4 border rounded-lg flex flex-col items-center justify-center text-center gap-2">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">{title}</p>
            {uploadedUrl ? (
                <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs font-semibold">Uploaded</span>
                </div>
            ) : (
                <Button variant="outline" size="sm" onClick={handleUploadClick} disabled={isUploading}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
            )}
        </div>
    )
}
