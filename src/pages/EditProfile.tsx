import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { ArrowLeft, Camera, User, Mail, Phone, MapPin } from "lucide-react";

const EditProfile = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { profile, loading, updateProfile } = useProfile();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
    });

    // Load profile data when available
    useEffect(() => {
        if (profile) {
            setFormData({
                firstName: profile.first_name || "",
                lastName: profile.last_name || "",
                phone: profile.phone || "",
                address: profile.address || "",
            });
        }
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const { error } = await updateProfile({
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            address: formData.address,
        });

        if (error) {
            toast({
                title: "Update Failed",
                description: error.message || "Could not update profile",
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "Profile Updated",
            description: "Your profile has been updated successfully",
        });
        navigate("/profile");
    };

    const getInitials = () => {
        if (!profile) return "U";
        const first = profile.first_name?.[0] || "";
        const last = profile.last_name?.[0] || "";
        return (first + last).toUpperCase() || "U";
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-card border-b border-border sticky top-0 z-10">
                <div className="max-w-lg mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/profile")}
                            className="rounded-full"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-xl font-bold">Edit Profile</h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
                {/* Avatar Section */}
                <Card className="p-6">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-24 w-24">
                                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                                    {getInitials()}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                size="icon"
                                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                                onClick={(e) => {
                                    e.preventDefault();
                                    toast({ title: "Feature coming soon!" });
                                }}
                            >
                                <Camera className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                {profile?.email}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Form */}
                <form onSubmit={handleSave} className="space-y-6">
                    <Card className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="First name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Last name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="pl-9"
                                    placeholder="Phone number"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="pl-9"
                                    placeholder="Address"
                                />
                            </div>
                        </div>
                    </Card>

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => navigate("/profile")}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;
