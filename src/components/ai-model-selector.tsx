import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  Brain, 
  Zap, 
  Shield, 
  Globe, 
  Key, 
  Info,
  Loader2
} from "lucide-react";

interface AIModelSelectorProps {
  onConfigChange: (config: AIDetectionConfig) => void;
  selectedConfig: AIDetectionConfig;
}

export interface AIDetectionConfig {
  method: string;
  modelChoice?: string;
  apiKey?: string;
  apiUrl?: string;
}

const AIModelSelector = ({ onConfigChange, selectedConfig }: AIModelSelectorProps) => {
  const [availableMethods, setAvailableMethods] = useState<Record<string, any>>({});
  const [availableModels, setAvailableModels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching AI detection options...');
        const [methodsData, modelsData] = await Promise.all([
          api.getAIDetectionMethods(),
          api.getAIDetectionModels()
        ]);
        
        console.log('Methods data:', methodsData);
        console.log('Models data:', modelsData);
        
        setAvailableMethods(methodsData.methods || {});
        setAvailableModels(modelsData.models || {});
      } catch (error) {
        console.error('Failed to fetch AI detection options:', error);
        toast({
          title: "Failed to load AI detection options",
          description: "Using default options. Please check your connection.",
          variant: "destructive",
        });
        
        // Set default fallback options
        setAvailableMethods({
          pretrained: {
            name: "Pre-trained Models",
            description: "HuggingFace transformer models (RoBERTa, etc.)",
            available: true,
            requires_internet: true,
            requires_api_key: false
          },
          statistical: {
            name: "Statistical Analysis",
            description: "Rule-based linguistic patterns",
            available: true,
            requires_internet: false,
            requires_api_key: false
          }
        });
        
        setAvailableModels({
          "roberta-openai": "RoBERTa OpenAI Detector",
          "roberta-chatgpt": "RoBERTa ChatGPT Detector",
          "roberta-general": "RoBERTa General AI Detector"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleMethodChange = (method: string) => {
    const updatedConfig = {
      ...selectedConfig,
      method,
      // Reset method-specific fields when changing methods
      modelChoice: method === 'pretrained' ? 'roberta-openai' : undefined,
      apiKey: undefined,
      apiUrl: undefined
    };
    onConfigChange(updatedConfig);
  };

  const handleConfigChange = (field: keyof AIDetectionConfig, value: string) => {
    onConfigChange({
      ...selectedConfig,
      [field]: value
    });
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'pretrained':
        return <Brain className="h-4 w-4" />;
      case 'gptzero_api':
        return <Shield className="h-4 w-4" />;
      case 'custom_api':
        return <Globe className="h-4 w-4" />;
      case 'statistical':
        return <Zap className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getMethodBadge = (methodInfo: any) => {
    const badges = [];
    
    if (methodInfo.requires_internet) {
      badges.push(<Badge key="internet" variant="outline" className="text-xs">
        <Globe className="h-3 w-3 mr-1" />
        Internet Required
      </Badge>);
    }
    
    if (methodInfo.requires_api_key) {
      badges.push(<Badge key="apikey" variant="outline" className="text-xs">
        <Key className="h-3 w-3 mr-1" />
        API Key Required
      </Badge>);
    }
    
    if (!methodInfo.available) {
      badges.push(<Badge key="unavailable" variant="destructive" className="text-xs">
        Unavailable
      </Badge>);
    }
    
    return badges;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading AI detection options...</span>
        </div>
      </Card>
    );
  }

  const selectedMethodInfo = availableMethods[selectedConfig.method];

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Bot className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Detection Configuration</h3>
      </div>

      {/* Method Selection */}
      <div className="space-y-3">
        <Label htmlFor="method-select">Detection Method</Label>
        <div className="text-xs text-muted-foreground mb-2">
          Current method: {selectedConfig.method} | Available methods: {Object.keys(availableMethods).join(', ')}
        </div>
        <Select value={selectedConfig.method} onValueChange={handleMethodChange}>
          <SelectTrigger id="method-select" className="cursor-pointer">
            <SelectValue placeholder="Select detection method" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(availableMethods).map(([key, methodInfo]) => (
              <SelectItem 
                key={key} 
                value={key} 
                disabled={!methodInfo.available}
                className="py-3 cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  {getMethodIcon(key)}
                  <div className="flex-1">
                    <div className="font-medium">{methodInfo.name}</div>
                    <div className="text-xs text-muted-foreground">{methodInfo.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedMethodInfo && (
          <div className="flex flex-wrap gap-2">
            {getMethodBadge(selectedMethodInfo)}
          </div>
        )}
      </div>

      <Separator />

      {/* Method-specific Configuration */}
      {selectedConfig.method === 'pretrained' && (
        <div className="space-y-3">
          <Label htmlFor="model-select">Pre-trained Model</Label>
          <Select 
            value={selectedConfig.modelChoice || 'roberta-openai'} 
            onValueChange={(value) => handleConfigChange('modelChoice', value)}
          >
            <SelectTrigger id="model-select">
              <SelectValue placeholder="Select AI detection model" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(availableModels).map(([displayName, modelKey]) => (
                <SelectItem key={modelKey} value={modelKey}>
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4" />
                    <span>{displayName}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-start space-x-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Pre-trained models offer the best accuracy for AI detection. RoBERTa models are recommended for most use cases.</p>
          </div>
        </div>
      )}

      {selectedConfig.method === 'gptzero_api' && (
        <div className="space-y-3">
          <Label htmlFor="api-key">GPTZero API Key</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="Enter your GPTZero API key"
            value={selectedConfig.apiKey || ''}
            onChange={(e) => handleConfigChange('apiKey', e.target.value)}
          />
          <div className="flex items-start space-x-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>GPTZero provides professional-grade AI detection. Get your API key from <a href="https://gptzero.me" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">gptzero.me</a></p>
          </div>
        </div>
      )}

      {selectedConfig.method === 'custom_api' && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="api-url">Custom API URL</Label>
            <Input
              id="api-url"
              type="url"
              placeholder="https://your-api-endpoint.com/detect"
              value={selectedConfig.apiUrl || ''}
              onChange={(e) => handleConfigChange('apiUrl', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="custom-api-key">API Key (Optional)</Label>
            <Input
              id="custom-api-key"
              type="password"
              placeholder="Enter API key if required"
              value={selectedConfig.apiKey || ''}
              onChange={(e) => handleConfigChange('apiKey', e.target.value)}
            />
          </div>
          <div className="flex items-start space-x-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Use your own AI detection API endpoint. The API should accept POST requests with text data and return AI probability scores.</p>
          </div>
        </div>
      )}

      {selectedConfig.method === 'statistical' && (
        <div className="space-y-3">
          <div className="flex items-start space-x-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Statistical analysis uses rule-based patterns to detect AI-generated content. Works offline but may be less accurate than AI models.</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AIModelSelector;