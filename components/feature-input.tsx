"use client"
import { Plus, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Feature {
    id: string
    name: string
    description: string
}

interface FeatureInputProps {
    features: Feature[]
    onChange: (features: Feature[]) => void
}

export function FeatureInput({ features = [], onChange }: FeatureInputProps) {
    const addFeature = () => {
        const newFeature = {
            id: `temp-${Date.now()}`,
            name: "",
            description: "",
        }
        onChange([...features, newFeature])
    }

    const updateFeature = (index: number, field: keyof Feature, value: string) => {
        const updatedFeatures = [...features]
        updatedFeatures[index] = {
            ...updatedFeatures[index],
            [field]: value,
        }
        onChange(updatedFeatures)
    }

    const removeFeature = (index: number) => {
        const updatedFeatures = [...features]
        updatedFeatures.splice(index, 1)
        onChange(updatedFeatures)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Project Features</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFeature} className="gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    Add Feature
                </Button>
            </div>

            {features.length === 0 && (
                <p className="text-sm text-muted-foreground">No features added yet. Click the button above to add features.</p>
            )}

            {features.map((feature, index) => (
                <div key={feature.id} className="space-y-2 p-3 border rounded-md relative">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFeature(index)}
                    >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Remove feature</span>
                    </Button>

                    <div className="space-y-1">
                        <Label htmlFor={`feature-name-${index}`} className="text-xs">
                            Feature Name
                        </Label>
                        <Input
                            id={`feature-name-${index}`}
                            value={feature.name}
                            onChange={(e) => updateFeature(index, "name", e.target.value)}
                            placeholder="Feature name"
                            className="max-w-md"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor={`feature-description-${index}`} className="text-xs">
                            Description (optional)
                        </Label>
                        <Textarea
                            id={`feature-description-${index}`}
                            value={feature.description}
                            onChange={(e) => updateFeature(index, "description", e.target.value)}
                            placeholder="Brief description of this feature"
                            rows={2}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}
