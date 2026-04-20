"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Check, Upload, X, Trash2 } from "lucide-react";
import { parseImages, parseVideos } from "@/lib/api";
import Image from "next/image";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface PropertyFormData {
    title: string;
    description: string;
    type: string;
    transactionType: string;
    price: string;
    surface: string;
    bedrooms: string;
    bathrooms: string;
    city: string;
    district: string;
    address: string;
    hasParking: boolean;
    hasGarden: boolean;
    hasPool: boolean;
    isFurnished: boolean;
    hasAirCon: boolean;
    hasGuardian: boolean;
    images: File[];
    existingImages: string[];
    videos: File[];
    existingVideos: string[];
}

const STEPS = [
    { id: 1, title: "Type & Transaction" },
    { id: 2, title: "Localisation" },
    { id: 3, title: "Caractéristiques" },
    { id: 4, title: "Prix & Surface" },
    { id: 5, title: "Médias" },
    { id: 6, title: "Description" },
];

export default function EditPropertyPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<PropertyFormData>({
        title: "",
        description: "",
        type: "",
        transactionType: "",
        price: "",
        surface: "",
        bedrooms: "",
        bathrooms: "",
        city: "",
        district: "",
        address: "",
        hasParking: false,
        hasGarden: false,
        hasPool: false,
        isFurnished: false,
        hasAirCon: false,
        hasGuardian: false,
        images: [],
        existingImages: [],
        videos: [],
        existingVideos: []
    });

    useEffect(() => {
        loadProperty();
    }, [params.id]);

    const loadProperty = async () => {
        try {
            const user = localStorage.getItem('user');
            if (!user) {
                router.push('/auth/login');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/properties/${params.id}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const property = await response.json();

                // Parse existing images
                const existingImages = parseImages(property.images);

                setFormData({
                    title: property.title,
                    description: property.description,
                    type: property.type,
                    transactionType: property.transactionType,
                    price: property.price.toString(),
                    surface: property.surface.toString(),
                    bedrooms: property.bedrooms?.toString() || "",
                    bathrooms: property.bathrooms?.toString() || "",
                    city: property.city,
                    district: property.district || "",
                    address: property.address,
                    hasParking: property.hasParking,
                    hasGarden: property.hasGarden,
                    hasPool: property.hasPool,
                    isFurnished: property.isFurnished,
                    hasAirCon: property.hasAirCon,
                    hasGuardian: property.hasGuardian,
                    images: [],
                    existingImages: existingImages,
                    videos: [],
                    existingVideos: parseVideos(property.videos)
                });
            } else {
                alert("Impossible de charger l'annonce");
                router.push('/dashboard/properties');
            }
        } catch (error) {
            console.error(error);
            alert("Erreur lors du chargement");
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
        }
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setFormData(prev => ({ ...prev, videos: [...prev.videos, ...files] }));
        }
    };

    const removeNewImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const removeNewVideo = (index: number) => {
        setFormData(prev => ({
            ...prev,
            videos: prev.videos.filter((_, i) => i !== index)
        }));
    };

    const removeExistingImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            existingImages: prev.existingImages.filter((_, i) => i !== index)
        }));
    };

    const removeExistingVideo = (index: number) => {
        setFormData(prev => ({
            ...prev,
            existingVideos: prev.existingVideos.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const user = localStorage.getItem('user');
            if (!user) {
                router.push('/auth/login');
                return;
            }

            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('type', formData.type);
            submitData.append('transactionType', formData.transactionType);
            submitData.append('price', formData.price);
            submitData.append('surface', formData.surface);
            submitData.append('bedrooms', formData.bedrooms);
            submitData.append('bathrooms', formData.bathrooms);
            submitData.append('city', formData.city);
            submitData.append('district', formData.district);
            submitData.append('address', formData.address);
            submitData.append('hasParking', String(formData.hasParking));
            submitData.append('hasGarden', String(formData.hasGarden));
            submitData.append('hasPool', String(formData.hasPool));
            submitData.append('isFurnished', String(formData.isFurnished));
            submitData.append('hasAirCon', String(formData.hasAirCon));
            submitData.append('hasGuardian', String(formData.hasGuardian));

            // Ajouter les images qui restent
            formData.existingImages.forEach((img) => {
                let relativePath = img;
                if (img.includes('/uploads/')) {
                    relativePath = '/uploads/' + img.split('/uploads/')[1];
                }
                submitData.append('existingImages', relativePath);
            });

            // Ajouter les nouvelles images
            formData.images.forEach((image) => {
                submitData.append('images', image);
            });

            // Ajouter les vidéos qui restent
            formData.existingVideos.forEach((vid) => {
                let relativePath = vid;
                if (vid.includes('/uploads/')) {
                    relativePath = '/uploads/' + vid.split('/uploads/')[1];
                }
                submitData.append('existingVideos', relativePath);
            });

            // Ajouter les nouvelles vidéos
            formData.videos.forEach((video) => {
                submitData.append('videos', video);
            });

            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const response = await fetch(`${API_BASE_URL}/properties/${params.id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: submitData
            });

            if (response.ok) {
                router.push('/dashboard/properties');
            } else {
                const error = await response.json();
                alert(`Erreur: ${error.message || 'Mise à jour échouée'}`);
            }
        } catch (error) {
            console.error('Error submitting property:', error);
            alert('Erreur lors de la mise à jour');
        } finally {
            setSubmitting(false);
        }
    };

    const nextStep = () => {
        if (currentStep < STEPS.length) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <Label>Type de bien *</Label>
                            <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="APPARTEMENT">Appartement</SelectItem>
                                    <SelectItem value="VILLA">Villa</SelectItem>
                                    <SelectItem value="MAISON">Maison</SelectItem>
                                    <SelectItem value="STUDIO">Studio</SelectItem>
                                    <SelectItem value="DUPLEX">Duplex</SelectItem>
                                    <SelectItem value="TERRAIN">Terrain</SelectItem>
                                    <SelectItem value="COMMERCE">Commerce</SelectItem>
                                    <SelectItem value="BUREAU">Bureau</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Type de transaction *</Label>
                            <Select value={formData.transactionType} onValueChange={(value) => updateFormData('transactionType', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez une transaction" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="VENTE">Vente</SelectItem>
                                    <SelectItem value="LOCATION">Location</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <Label>Ville *</Label>
                            <Input
                                value={formData.city}
                                onChange={(e) => updateFormData('city', e.target.value)}
                                placeholder="Ex: Dakar"
                            />
                        </div>
                        <div>
                            <Label>Quartier *</Label>
                            <Input
                                value={formData.district}
                                onChange={(e) => updateFormData('district', e.target.value)}
                                placeholder="Ex: Almadies"
                            />
                        </div>
                        <div>
                            <Label>Adresse complète *</Label>
                            <Input
                                value={formData.address}
                                onChange={(e) => updateFormData('address', e.target.value)}
                                placeholder="Ex: Route des Almadies, Dakar"
                            />
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Chambres</Label>
                                <Input
                                    type="number"
                                    value={formData.bedrooms}
                                    onChange={(e) => updateFormData('bedrooms', e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <Label>Salles de bain</Label>
                                <Input
                                    type="number"
                                    value={formData.bathrooms}
                                    onChange={(e) => updateFormData('bathrooms', e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label>Équipements</Label>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={formData.hasParking}
                                        onCheckedChange={(checked) => updateFormData('hasParking', checked)}
                                    />
                                    <label className="text-sm">Parking</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={formData.hasGarden}
                                        onCheckedChange={(checked) => updateFormData('hasGarden', checked)}
                                    />
                                    <label className="text-sm">Jardin</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={formData.hasPool}
                                        onCheckedChange={(checked) => updateFormData('hasPool', checked)}
                                    />
                                    <label className="text-sm">Piscine</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={formData.isFurnished}
                                        onCheckedChange={(checked) => updateFormData('isFurnished', checked)}
                                    />
                                    <label className="text-sm">Meublé</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={formData.hasAirCon}
                                        onCheckedChange={(checked) => updateFormData('hasAirCon', checked)}
                                    />
                                    <label className="text-sm">Climatisation</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={formData.hasGuardian}
                                        onCheckedChange={(checked) => updateFormData('hasGuardian', checked)}
                                    />
                                    <label className="text-sm">Gardien</label>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div>
                            <Label>Prix (FCFA) *</Label>
                            <Input
                                type="number"
                                value={formData.price}
                                onChange={(e) => updateFormData('price', e.target.value)}
                                placeholder="Ex: 50000000"
                            />
                        </div>
                        <div>
                            <Label>Surface (m²) *</Label>
                            <Input
                                type="number"
                                value={formData.surface}
                                onChange={(e) => updateFormData('surface', e.target.value)}
                                placeholder="Ex: 150"
                            />
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-10">
                        <div>
                            <Label className="text-lg font-bold">Photos du bien</Label>

                            {/* Existing Images */}
                            {formData.existingImages.length > 0 && (
                                <div className="mb-6 mt-4">
                                    <h4 className="text-sm font-medium mb-3 text-gray-500">Photos actuelles</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {formData.existingImages.map((image, index) => (
                                            <div key={`existing-${index}`} className="relative group h-32">
                                                <Image
                                                    src={image}
                                                    alt={`Photo ${index + 1}`}
                                                    fill
                                                    className="object-cover rounded-lg"
                                                />
                                                <button
                                                    onClick={() => removeExistingImage(index)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Images Upload */}
                            <div className="mt-2">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">Ajouter de nouvelles photos</p>
                                        <p className="text-xs text-gray-400">PNG, JPG (max. 5MB par image)</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            </div>

                            {/* New Images Preview */}
                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    {formData.images.map((image, index) => (
                                        <div key={`new-${index}`} className="relative group h-32">
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                            <button
                                                onClick={() => removeNewImage(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="absolute bottom-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                                                Nouvelle
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="border-t pt-8">
                            <Label className="text-lg font-bold">Vidéos du bien (max. 3)</Label>
                            
                            {/* Existing Videos */}
                            {formData.existingVideos.length > 0 && (
                                <div className="mb-6 mt-4">
                                    <h4 className="text-sm font-medium mb-3 text-gray-500">Vidéos actuelles</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {formData.existingVideos.map((video, index) => (
                                            <div key={`existing-vid-${index}`} className="relative group h-40 bg-black rounded-lg overflow-hidden">
                                                <video
                                                    src={video}
                                                    className="w-full h-full object-cover"
                                                    controls
                                                />
                                                <button
                                                    onClick={() => removeExistingVideo(index)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Videos Upload */}
                            <div className="mt-2">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">Ajouter de nouvelles vidéos</p>
                                        <p className="text-xs text-gray-400">MP4, WebM (max. 50MB)</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        multiple
                                        accept="video/*"
                                        onChange={handleVideoUpload}
                                    />
                                </label>
                            </div>

                            {/* New Videos Preview */}
                            {formData.videos.length > 0 && (
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    {formData.videos.map((video, index) => (
                                        <div key={`new-vid-${index}`} className="relative group h-40 bg-black rounded-lg overflow-hidden">
                                            <video
                                                src={URL.createObjectURL(video)}
                                                className="w-full h-full object-cover"
                                                controls
                                            />
                                            <button
                                                onClick={() => removeNewVideo(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="absolute bottom-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs z-10">
                                                Nouvelle
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 6:
                return (
                    <div className="space-y-6">
                        <div>
                            <Label>Titre de l'annonce *</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => updateFormData('title', e.target.value)}
                                placeholder="Ex: Belle villa moderne avec piscine"
                            />
                        </div>
                        <div>
                            <Label>Description *</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => updateFormData('description', e.target.value)}
                                placeholder="Décrivez votre bien en détail..."
                                rows={8}
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Chargement de l'annonce...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Modifier l'annonce</h1>
                    <p className="text-gray-600">Mettez à jour les informations de votre bien</p>
                </div>

                {/* Stepper */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, index) => (
                            <div key={step.id} className="flex items-center flex-1">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep > step.id
                                            ? 'bg-green-500 text-white'
                                            : currentStep === step.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-600'
                                            }`}
                                    >
                                        {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                                    </div>
                                    <span className="text-xs mt-2 text-center hidden md:block">{step.title}</span>
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {renderStepContent()}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                            <Button
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Précédent
                            </Button>

                            {currentStep < STEPS.length ? (
                                <Button onClick={nextStep}>
                                    Suivant
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {submitting ? 'Mise à jour...' : 'Mettre à jour l\'annonce'}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
