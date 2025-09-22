"""
AI Content Detection Module

This module provides multiple methods for detecting AI-generated content:
1. Pre-trained transformer models (Option A)
2. External API services (Option B) 
3. Statistical/rule-based analysis (Option C)
"""

import re
import math
import statistics
import requests
import json
from typing import List, Dict, Tuple, Optional
import streamlit as st

try:
    import torch
    from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
    from huggingface_hub import hf_hub_download, snapshot_download, list_repo_files
    HF_AVAILABLE = True
except ImportError:
    HF_AVAILABLE = False
    st.warning("Transformers/HuggingFace Hub not available. Some AI detection methods will be disabled.")

# ============================================================================
# OPTION A: PRE-TRAINED MODELS
# ============================================================================

@st.cache_resource(show_spinner=False)
def load_ai_detector_model(model_choice: str = "roberta-openai"):
    """Load pre-trained AI detection model with HuggingFace Hub optimizations."""
    if not HF_AVAILABLE:
        return None
    
    model_configs = {
        "roberta-openai": {
            "name": "openai-community/roberta-base-openai-detector",
            "description": "OpenAI's RoBERTa model for GPT detection (HF Hub Optimized)",
            "use_fast_tokenizer": True,
            "torch_dtype": torch.float16 if torch.cuda.is_available() else torch.float32,
            "ai_labels": ["Fake", "AI", "MACHINE", "1"],  # Labels that indicate AI content
            "human_labels": ["Real", "HUMAN", "0"]  # Labels that indicate human content
        },
        "chatgpt-detector": {
            "name": "Hello-SimpleAI/chatgpt-detector-roberta", 
            "description": "Specialized ChatGPT detector (HF Hub Optimized)",
            "use_fast_tokenizer": True,
            "torch_dtype": torch.float16 if torch.cuda.is_available() else torch.float32,
            "ai_labels": ["ChatGPT", "AI", "MACHINE", "1"],
            "human_labels": ["Human", "HUMAN", "0"]
        },
        "ai-content-detector": {
            "name": "openai-community/roberta-base-openai-detector",
            "description": "General AI content detection (Same as OpenAI RoBERTa)",
            "use_fast_tokenizer": True,
            "torch_dtype": torch.float16 if torch.cuda.is_available() else torch.float32,
            "ai_labels": ["Fake", "AI", "MACHINE", "1", "ARTIFICIAL"],
            "human_labels": ["Real", "HUMAN", "ORIGINAL", "0"],
            "processing_mode": "general"  # Different processing for general detection
        },
        "roberta-base-detector": {
            "name": "roberta-base",
            "description": "RoBERTa Base model adapted for AI detection",
            "use_fast_tokenizer": True,
            "torch_dtype": torch.float32,
            "ai_labels": ["1", "POSITIVE", "AI"],
            "human_labels": ["0", "NEGATIVE", "HUMAN"],
            "requires_fine_tuning": True
        }
    }
    
    if model_choice not in model_configs:
        model_choice = "roberta-openai"
    
    config = model_configs[model_choice]
    model_name = config["name"]
    
    # Check if model requires special handling
    if config.get("requires_fine_tuning"):
        st.warning(f"Model '{model_choice}' requires fine-tuning for AI detection. Using statistical analysis instead.")
        return None
    
    # Try loading with optimizations first
    try:
        # Pre-download model files for faster loading
        with st.spinner(f"Downloading {model_choice} model files (first time only)..."):
            try:
                # Download model repository snapshot for optimal caching
                snapshot_download(repo_id=model_name, cache_dir=None)
            except Exception as download_error:
                st.warning(f"Snapshot download failed: {download_error}")
                st.info("Continuing with standard loading...")
        
        # Load tokenizer with HF Hub optimizations
        tokenizer = AutoTokenizer.from_pretrained(
            model_name,
            use_fast=config.get("use_fast_tokenizer", True),
            trust_remote_code=False,
            cache_dir=None  # Use default HF cache
        )
        
        # Load model with optimized settings
        model_kwargs = {
            "trust_remote_code": False,
            "cache_dir": None,
            "torch_dtype": config.get("torch_dtype", torch.float32),
            "low_cpu_mem_usage": True,  # Optimize memory usage
        }
        
        # Add device mapping for CUDA if available
        if torch.cuda.is_available():
            model_kwargs["device_map"] = "auto"
        
        model = AutoModelForSequenceClassification.from_pretrained(
            model_name,
            **model_kwargs
        )
        
        # Create optimized pipeline
        device = 0 if torch.cuda.is_available() else -1
        pipeline_kwargs = {
            "model": model,
            "tokenizer": tokenizer,
            "device": device,
            "max_length": 512,
            "truncation": True,
            "padding": True,
            "return_all_scores": False,  # Only return top score for efficiency
        }
        
        # Add batch processing for better performance
        if torch.cuda.is_available():
            pipeline_kwargs["batch_size"] = 8  # Process multiple texts at once
        
        classifier = pipeline("text-classification", **pipeline_kwargs)
        
        return {
            "classifier": classifier,
            "name": model_choice,
            "description": config["description"],
            "optimized": True,
            "torch_dtype": str(config.get("torch_dtype", torch.float32)),
            "device": "CUDA" if torch.cuda.is_available() else "CPU",
            "ai_labels": config.get("ai_labels", ["AI", "MACHINE", "FAKE", "1"]),
            "human_labels": config.get("human_labels", ["HUMAN", "REAL", "0"]),
            "processing_mode": config.get("processing_mode", "standard")
        }
        
    except Exception as e:
        error_msg = str(e)
        st.error(f"Failed to load AI detector model '{model_choice}': {error_msg}")
        
        # Check if there's a fallback model specified
        fallback_model = config.get("fallback_to")
        if fallback_model and fallback_model != model_choice:
            st.info(f"Trying fallback model: {fallback_model}")
            return load_ai_detector_model(fallback_model)
        
        # Try standard loading without optimizations
        try:
            st.info("Attempting fallback loading without optimizations...")
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForSequenceClassification.from_pretrained(model_name)
            classifier = pipeline("text-classification", model=model, tokenizer=tokenizer)
            
            return {
                "classifier": classifier,
                "name": model_choice,
                "description": config["description"] + " (Fallback Mode)",
                "optimized": False,
                "ai_labels": config.get("ai_labels", ["AI", "MACHINE", "FAKE", "1"]),
                "human_labels": config.get("human_labels", ["HUMAN", "REAL", "0"]),
                "processing_mode": config.get("processing_mode", "standard")
            }
        except Exception as fallback_error:
            st.error(f"Fallback loading also failed: {fallback_error}")
            
            # Final fallback: try the most reliable model (OpenAI RoBERTa)
            if model_choice != "roberta-openai":
                st.info("Trying most reliable model: OpenAI RoBERTa...")
                return load_ai_detector_model("roberta-openai")
            
            return None

def extract_ai_score(result, ai_labels: List[str], human_labels: List[str]) -> float:
    """Extract AI probability score from model result, handling different label formats."""
    if isinstance(result, list):
        result = result[0] if result else {"score": 0, "label": "HUMAN"}
    
    if not isinstance(result, dict):
        return 0.0
    
    label = result.get('label', '').upper()
    score = result.get('score', 0)
    
    # Check if label indicates AI content
    for ai_label in ai_labels:
        if ai_label.upper() in label:
            return max(0, min(1, score))
    
    # Check if label indicates human content  
    for human_label in human_labels:
        if human_label.upper() in label:
            return max(0, min(1, 1 - score))
    
    # If label is unknown, try to infer from common patterns
    if any(term in label for term in ['GENERATED', 'ARTIFICIAL', 'BOT', 'SYNTHETIC']):
        return max(0, min(1, score))
    elif any(term in label for term in ['NATURAL', 'AUTHENTIC', 'GENUINE']):
        return max(0, min(1, 1 - score))
    
    # Default: assume higher score means more AI-like
    return max(0, min(1, score))

def analyze_with_pretrained_model(text: str, sentences: List[str], model_choice: str = "roberta-openai") -> Dict:
    """Analyze text using pre-trained transformer models with HF Hub optimizations."""
    detector = load_ai_detector_model(model_choice)
    
    if not detector:
        return {"available": False, "error": "Model not available"}
    
    classifier = detector["classifier"]
    is_optimized = detector.get("optimized", False)
    ai_labels = detector.get("ai_labels", ["AI", "MACHINE", "FAKE", "1"])
    human_labels = detector.get("human_labels", ["HUMAN", "REAL", "0"])
    processing_mode = detector.get("processing_mode", "standard")
    
    try:
        # Analyze overall document (use larger sample for better models)
        sample_size = 2000 if is_optimized else 1000
        doc_sample = text[:sample_size]
        
        # Analyze overall document first
        overall_result = classifier(doc_sample)
        overall_ai_score = extract_ai_score(overall_result, ai_labels, human_labels)
        
        # For general processing mode, apply more conservative scoring
        if processing_mode == "general":
            overall_ai_score = min(overall_ai_score * 0.8, 0.9)  # Slightly reduce confidence
        
        # Process sentences
        sentence_scores = []
        
        if is_optimized and len(sentences) > 1:
            # Use batch processing for optimized models
            batch_size = 8 if torch.cuda.is_available() else 4
            
            with st.progress(0, text="Analyzing sentences with optimized model..."):
                for i in range(0, len(sentences), batch_size):
                    batch = [s for s in sentences[i:i+batch_size] if len(s.strip()) > 10]
                    if not batch:
                        # Add zeros for empty/short sentences
                        sentence_scores.extend([0.0] * min(batch_size, len(sentences) - i))
                        continue
                        
                    progress = (i + len(batch)) / len(sentences)
                    st.progress(progress, text=f"Processing batch {i//batch_size + 1}...")
                    
                    # Analyze batch
                    batch_results = classifier(batch)
                    
                    # Extract scores from batch results
                    batch_scores = []
                    for result in batch_results:
                        score = extract_ai_score(result, ai_labels, human_labels)
                        # Apply general processing adjustments
                        if processing_mode == "general":
                            score = min(score * 0.85, 0.9)  # More conservative scoring
                        batch_scores.append(score)
                    
                    sentence_scores.extend(batch_scores)
                    
                    # Fill remaining slots if batch was smaller
                    remaining = min(batch_size, len(sentences) - i) - len(batch_scores)
                    sentence_scores.extend([0.0] * remaining)
        else:
            # Standard single-processing for non-optimized models or small documents
            max_sentences = 20 if not is_optimized else len(sentences)
            
            for i, sentence in enumerate(sentences[:max_sentences]):
                if len(sentence.strip()) > 10:  # Only analyze substantial sentences
                    try:
                        result = classifier(sentence)
                        score = extract_ai_score(result, ai_labels, human_labels)
                        # Apply general processing adjustments
                        if processing_mode == "general":
                            score = min(score * 0.85, 0.9)  # More conservative scoring
                        sentence_scores.append(score)
                    except Exception:
                        sentence_scores.append(0.0)
                else:
                    sentence_scores.append(0.0)
            
            # If we limited sentences, fill the rest with zeros
            sentence_scores.extend([0.0] * (len(sentences) - len(sentence_scores)))
        
        return {
            "available": True,
            "method": f"Pre-trained Model ({detector['description']})",
            "overall_score": overall_ai_score,
            "sentence_scores": sentence_scores,
            "high_risk_sentences": sum(1 for s in sentence_scores if s > 0.7),
            "medium_risk_sentences": sum(1 for s in sentence_scores if 0.4 <= s <= 0.7),
            "model_used": model_choice,
            "optimized": is_optimized,
            "device": detector.get("device", "Unknown"),
            "total_sentences_analyzed": len(sentence_scores)
        }
        
    except Exception as e:
        return {"available": False, "error": f"Analysis failed: {e}"}

# ============================================================================
# OPTION B: EXTERNAL API SERVICES
# ============================================================================

def analyze_with_gptzero_api(text: str, sentences: List[str], api_key: str) -> Dict:
    """Analyze text using GPTZero API."""
    if not api_key:
        return {"available": False, "error": "API key required"}
    
    try:
        headers = {
            'accept': 'application/json',
            'X-Api-Key': api_key,
            'Content-Type': 'application/json'
        }
        
        # Analyze the full document
        payload = {
            'document': text[:10000]  # GPTZero has text limits
        }
        
        with st.spinner("Analyzing with GPTZero API..."):
            response = requests.post(
                'https://api.gptzero.me/v2/predict/text',
                headers=headers,
                json=payload,
                timeout=30
            )
        
        if response.status_code == 200:
            result = response.json()
            
            # Extract overall probability
            overall_prob = result.get('documents', [{}])[0].get('completely_generated_prob', 0)
            
            # GPTZero provides sentence-level analysis
            sentence_probs = []
            sentences_data = result.get('documents', [{}])[0].get('sentences', [])
            
            for i, sent in enumerate(sentences):
                if i < len(sentences_data):
                    sent_prob = sentences_data[i].get('generated_prob', 0)
                    sentence_probs.append(sent_prob)
                else:
                    sentence_probs.append(0.0)
            
            return {
                "available": True,
                "method": "GPTZero API",
                "overall_score": overall_prob,
                "sentence_scores": sentence_probs,
                "high_risk_sentences": sum(1 for s in sentence_probs if s > 0.7),
                "medium_risk_sentences": sum(1 for s in sentence_probs if 0.4 <= s <= 0.7),
                "api_response": result
            }
        else:
            return {"available": False, "error": f"API error: {response.status_code}"}
            
    except Exception as e:
        return {"available": False, "error": f"API request failed: {e}"}

def analyze_with_custom_api(text: str, sentences: List[str], api_url: str, api_key: str = None) -> Dict:
    """Analyze text using custom API endpoint."""
    if not api_url:
        return {"available": False, "error": "API URL required"}
    
    try:
        headers = {'Content-Type': 'application/json'}
        if api_key:
            headers['Authorization'] = f'Bearer {api_key}'
        
        payload = {
            'text': text[:5000],  # Limit text size
            'return_probabilities': True
        }
        
        with st.spinner("Analyzing with custom API..."):
            response = requests.post(api_url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            
            # Try to extract score (API-dependent)
            overall_score = result.get('ai_probability', result.get('score', 0))
            
            return {
                "available": True,
                "method": "Custom API",
                "overall_score": overall_score,
                "sentence_scores": [overall_score] * len(sentences),  # Uniform distribution
                "high_risk_sentences": len(sentences) if overall_score > 0.7 else 0,
                "medium_risk_sentences": len(sentences) if 0.4 <= overall_score <= 0.7 else 0,
                "api_response": result
            }
        else:
            return {"available": False, "error": f"API error: {response.status_code}"}
            
    except Exception as e:
        return {"available": False, "error": f"API request failed: {e}"}

# ============================================================================
# OPTION C: STATISTICAL/RULE-BASED ANALYSIS
# ============================================================================

def analyze_with_statistical_methods(text: str, sentences: List[str]) -> Dict:
    """Analyze text using statistical and rule-based methods."""
    
    try:
        # Initialize analysis components
        scores = []
        patterns = {}
        
        # 1. Sentence length uniformity (AI tends to be more uniform)
        sent_lengths = [len(s.split()) for s in sentences if len(s.strip()) > 5]
        if sent_lengths:
            length_variance = statistics.variance(sent_lengths) if len(sent_lengths) > 1 else 0
            avg_length = statistics.mean(sent_lengths)
            patterns['avg_sentence_length'] = avg_length
            patterns['length_variance'] = length_variance
            
            # Low variance suggests AI
            length_score = max(0, 1 - (length_variance / 50))  # Normalize variance
            scores.append(length_score)
        
        # 2. Vocabulary diversity (AI tends to be less diverse)
        words = re.findall(r'\b\w+\b', text.lower())
        if words:
            unique_words = len(set(words))
            total_words = len(words)
            vocab_diversity = unique_words / total_words
            patterns['vocab_diversity'] = vocab_diversity
            
            # Lower diversity suggests AI
            vocab_score = max(0, 1 - vocab_diversity * 2)  # Scale appropriately
            scores.append(vocab_score)
        
        # 3. Transition word frequency (AI often overuses transitions)
        transition_words = ['however', 'furthermore', 'moreover', 'therefore', 'consequently', 
                          'nevertheless', 'additionally', 'specifically', 'ultimately']
        transition_count = sum(text.lower().count(word) for word in transition_words)
        total_sentences = len(sentences)
        if total_sentences > 0:
            transition_freq = (transition_count / total_sentences) * 100
            patterns['transition_frequency'] = transition_freq
            
            # High frequency suggests AI
            transition_score = min(1, transition_freq / 20)  # Normalize
            scores.append(transition_score)
        
        # 4. Repetitive phrase detection
        phrases = []
        words_list = text.split()
        for i in range(len(words_list) - 2):
            phrase = ' '.join(words_list[i:i+3])
            phrases.append(phrase.lower())
        
        if phrases:
            phrase_counts = {}
            for phrase in phrases:
                phrase_counts[phrase] = phrase_counts.get(phrase, 0) + 1
            
            repeated_phrases = sum(1 for count in phrase_counts.values() if count > 1)
            repetition_score = min(1, repeated_phrases / 10)  # Normalize
            scores.append(repetition_score)
        
        # 5. Burstiness (human writing varies more in sentence complexity)
        complexity_scores = []
        for sent in sentences:
            if len(sent.strip()) > 5:
                # Simple complexity measure: punctuation + subordinate clauses
                complexity = len(re.findall(r'[,;:]', sent)) + len(re.findall(r'\b(that|which|who|when|where|because|although|while|since)\b', sent.lower()))
                complexity_scores.append(complexity)
        
        if complexity_scores and len(complexity_scores) > 1:
            burstiness = statistics.stdev(complexity_scores) if len(complexity_scores) > 1 else 0
            patterns['burstiness'] = burstiness
            
            # Lower burstiness suggests AI
            burst_score = max(0, 1 - (burstiness / 3))  # Normalize
            scores.append(burst_score)
        
        # Calculate overall score
        overall_score = statistics.mean(scores) if scores else 0
        
        # Create sentence-level scores (simplified)
        sentence_scores = []
        for sent in sentences:
            # Basic sentence-level heuristics
            sent_score = 0
            sent_words = sent.split()
            
            # Length uniformity
            if 15 <= len(sent_words) <= 25:  # "AI-like" length
                sent_score += 0.3
            
            # Transition word presence
            if any(word in sent.lower() for word in transition_words):
                sent_score += 0.2
            
            # Formal structure
            if sent.count(',') >= 2:  # Multiple clauses
                sent_score += 0.1
            
            sentence_scores.append(min(1, sent_score))
        
        return {
            "available": True,
            "method": "Statistical Analysis",
            "overall_score": overall_score,
            "sentence_scores": sentence_scores,
            "high_risk_sentences": sum(1 for s in sentence_scores if s > 0.7),
            "medium_risk_sentences": sum(1 for s in sentence_scores if 0.4 <= s <= 0.7),
            "detailed_analysis": {
                "patterns": patterns,
                "component_scores": {
                    "sentence_uniformity": scores[0] if len(scores) > 0 else 0,
                    "vocabulary_diversity": scores[1] if len(scores) > 1 else 0,
                    "transition_frequency": scores[2] if len(scores) > 2 else 0,
                    "phrase_repetition": scores[3] if len(scores) > 3 else 0,
                    "burstiness": scores[4] if len(scores) > 4 else 0
                }
            }
        }
        
    except Exception as e:
        return {"available": False, "error": f"Statistical analysis failed: {e}"}

# ============================================================================
# MAIN ANALYSIS FUNCTION
# ============================================================================

def analyze_ai_content(text: str, sentences: List[str], method: str = "pretrained", **kwargs) -> Dict:
    """
    Main function to analyze AI content using specified method.
    
    Args:
        text: Full document text
        sentences: List of sentences
        method: Analysis method ("pretrained", "gptzero_api", "custom_api", "statistical")
        **kwargs: Method-specific parameters
    
    Returns:
        Dict with analysis results
    """
    
    if method == "pretrained":
        model_choice = kwargs.get("model_choice", "roberta-openai")
        return analyze_with_pretrained_model(text, sentences, model_choice)
    
    elif method == "gptzero_api":
        api_key = kwargs.get("api_key", "")
        return analyze_with_gptzero_api(text, sentences, api_key)
    
    elif method == "custom_api":
        api_url = kwargs.get("api_url", "")
        api_key = kwargs.get("api_key", "")
        return analyze_with_custom_api(text, sentences, api_url, api_key)
    
    elif method == "statistical":
        return analyze_with_statistical_methods(text, sentences)
    
    else:
        return {"available": False, "error": f"Unknown method: {method}"}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def get_available_methods() -> Dict[str, Dict]:
    """Get information about available AI detection methods."""
    methods = {
        "pretrained": {
            "name": "Pre-trained Models",
            "description": "HuggingFace transformer models (RoBERTa, etc.)",
            "available": HF_AVAILABLE,
            "requires_internet": True,
            "requires_api_key": False
        },
        "gptzero_api": {
            "name": "GPTZero API",
            "description": "Professional AI detection service",
            "available": True,
            "requires_internet": True,
            "requires_api_key": True
        },
        "custom_api": {
            "name": "Custom API",
            "description": "Your own AI detection endpoint",
            "available": True,
            "requires_internet": True,
            "requires_api_key": False
        },
        "statistical": {
            "name": "Statistical Analysis",
            "description": "Rule-based linguistic patterns",
            "available": True,
            "requires_internet": False,
            "requires_api_key": False
        }
    }
    
    return methods

def get_model_choices() -> Dict[str, str]:
    """Get available pre-trained model choices with HF Hub optimization info."""
    cuda_available = torch.cuda.is_available() if HF_AVAILABLE else False
    performance_suffix = " [GPU Accelerated]" if cuda_available else " [CPU Mode]"
    
    base_choices = {
        "OpenAI RoBERTa (Most Reliable)": "roberta-openai",
        "ChatGPT Detector RoBERTa": "chatgpt-detector", 
        "General AI Detector (RoBERTa-based)": "ai-content-detector"
    }
    
    # Add performance info to choices
    enhanced_choices = {}
    for display_name, model_key in base_choices.items():
        enhanced_name = display_name + performance_suffix
        if model_key == "ai-content-detector":
            enhanced_name += " ✅ Reliable"  # Indicate this is now reliable
        enhanced_choices[enhanced_name] = model_key
    
    return enhanced_choices

def get_performance_info() -> Dict[str, str]:
    """Get information about HF Hub optimizations and performance."""
    info = {
        "HuggingFace Hub": "✅ Enabled - Optimized model caching and loading",
        "Model Loading": "✅ Snapshot downloads for faster subsequent loads",
        "Memory Usage": "✅ Low CPU memory usage optimization enabled",
        "Batch Processing": "✅ Enabled for multiple sentence analysis"
    }
    
    if HF_AVAILABLE:
        try:
            if torch.cuda.is_available():
                info["GPU Acceleration"] = "✅ CUDA available - Using float16 precision"
                info["Device Mapping"] = "✅ Automatic device mapping enabled"
                info["Batch Size"] = "8 sentences per batch (GPU optimized)"
            else:
                info["GPU Acceleration"] = "❌ CPU only - Consider GPU for better performance"
                info["Batch Size"] = "4 sentences per batch (CPU optimized)"
        except:
            info["GPU Status"] = "❓ Unable to determine GPU status"
    else:
        info["Status"] = "❌ HuggingFace Hub not available"
    
    return info