import AppLayout from "@/components/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { mockUser } from "@/lib/data";

export default function ProfilePage() {
  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
        <h1 className="font-headline text-3xl font-bold mb-6">My Profile</h1>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={mockUser.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue={mockUser.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue={mockUser.phone} />
                </div>
                <Button className="font-bold">Save Changes</Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
             <div className="flex items-center flex-col text-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={mockUser.image.imageUrl} alt={mockUser.name} data-ai-hint={mockUser.image.imageHint} />
                  <AvatarFallback className="text-4xl">{mockUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button variant="outline">Change Photo</Button>
             </div>

             <Card>
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="notifications" className="flex flex-col space-y-1">
                            <span>Email Notifications</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                                Receive updates and offers.
                            </span>
                        </Label>
                        <Switch id="notifications" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                            <span>Dark Mode</span>
                             <span className="font-normal leading-snug text-muted-foreground">
                                Toggle the interface theme.
                            </span>
                        </Label>
                        <Switch id="dark-mode" />
                    </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
