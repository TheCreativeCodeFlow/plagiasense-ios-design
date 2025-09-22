import io
import re
import base64
from typing import List, Tuple, Dict, Optional

import streamlit as st
import pdfplumber
import numpy as np
import torch

# Sentence-BERT
from sentence_transformers import SentenceTransformer, util

# Sentence splitting
import nltk
from nltk.tokenize import sent_tokenize

# AI Detection
import ai_detector

# --------- Config ---------
st.set_page_config(page_title="BERT Plagiarism Checker", page_icon="📑", layout="wide")

# Initialize session state for naviga# --------- App UI ---------
st.title("📑 Academic Integrity Checker - Plagiarism & AI Detection")
st.caption("Upload PDFs: the **first** is the student document to check; the **rest** are reference documents.")
if 'current_flagged_index' not in st.session_state:
    st.session_state.current_flagged_index = 0
if 'flagged_sentences' not in st.session_state:
    st.session_state.flagged_sentences = []
if 'processing_complete' not in st.session_state:
    st.session_state.processing_complete = False
if 'last_file_hash' not in st.session_state:
    st.session_state.last_file_hash = None
if 'cached_results' not in st.session_state:
    st.session_state.cached_results = None

# Thresholds (tune as you like)
RED_THRESHOLD = 0.85       # likely copy/near-copy
ORANGE_THRESHOLD = 0.70    # likely paraphrased
MAX_SENTENCES = 5000       # increased safety limit
BATCH_SIZE = 32           # for efficient processing

# --------- Utils ---------
@st.cache_resource(show_spinner=False)
def load_model(model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
    """Load Sentence-BERT model with configurable model selection."""
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    return SentenceTransformer(model_name, device=device)

def get_available_models() -> Dict[str, str]:
    """Return available pre-trained models."""
    return {
        "all-MiniLM-L6-v2 (Fast & Balanced)": "sentence-transformers/all-MiniLM-L6-v2",
        "all-mpnet-base-v2 (High Quality)": "sentence-transformers/all-mpnet-base-v2",
        "all-distilroberta-v1 (Good Balance)": "sentence-transformers/all-distilroberta-v1"
    }

def read_pdf(file) -> str:
    """Extract text from a PDF file-like object with improved error handling."""
    try:
        with pdfplumber.open(file) as pdf:
            texts = []
            for i, page in enumerate(pdf.pages):
                try:
                    t = page.extract_text() or ""
                    # Normalize whitespace and clean up common PDF artifacts
                    t = re.sub(r"[ \t]+", " ", t)
                    t = re.sub(r"-\n", "", t)  # Remove hyphenation at line breaks
                    t = re.sub(r"\n+", "\n", t)  # Normalize line breaks
                    texts.append(t)
                except Exception as e:
                    st.warning(f"Error extracting text from page {i+1}: {e}")
                    continue
                    
        doc_text = "\n".join(texts)
        # Basic cleanup: remove multiple blank lines
        doc_text = re.sub(r"\n{3,}", "\n\n", doc_text).strip()
        return doc_text
    except Exception as e:
        st.error(f"Failed to read PDF: {e}")
        return ""

@st.cache_data(show_spinner=False)
def nltk_download_punkt():
    """Download NLTK punkt tokenizer with fallback for different versions."""
    try:
        # Try the new punkt_tab first (NLTK 3.8+)
        nltk.download("punkt_tab", quiet=True)
    except:
        try:
            # Fallback to old punkt tokenizer
            nltk.download("punkt", quiet=True)
        except:
            st.error("Failed to download NLTK tokenizer. Please check your internet connection.")

def split_sentences_alternative(text: str) -> List[str]:
    """Alternative sentence splitting without NLTK dependency."""
    # Improved reference section removal
    patterns = [
        r"\n\s*(references|bibliography|works cited|citations?)\s*\n",
        r"\n\s*(appendix|appendices)\s*[a-z]?\s*\n"
    ]
    
    for pattern in patterns:
        split = re.split(pattern, text, flags=re.IGNORECASE, maxsplit=1)
        if len(split) > 1:
            text = split[0]
            break
    
    # Basic sentence splitting using regex
    # Split on sentence endings, but be careful with abbreviations
    sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z])', text)
    
    # Filter and clean sentences
    sents = []
    for s in sentences:
        s = s.strip()
        # Skip very short sentences and number-only sentences
        if len(s) > 20 and not re.match(r'^[\d\s\.\-]+$', s):
            # Remove extra whitespace
            s = re.sub(r'\s+', ' ', s)
            sents.append(s)
    
    if len(sents) > MAX_SENTENCES:
        st.warning(f"Document has {len(sents)} sentences. Using first {MAX_SENTENCES} for analysis.")
        sents = sents[:MAX_SENTENCES]
    
    return sents

def split_sentences_nltk(text: str) -> List[str]:
    """NLTK-based sentence splitting."""
    # Improved reference section removal
    patterns = [
        r"\n\s*(references|bibliography|works cited|citations?)\s*\n",
        r"\n\s*(appendix|appendices)\s*[a-z]?\s*\n"
    ]
    
    for pattern in patterns:
        split = re.split(pattern, text, flags=re.IGNORECASE, maxsplit=1)
        if len(split) > 1:
            text = split[0]
            break
    
    # Filter out very short sentences and clean up
    sents = []
    for s in sent_tokenize(text):
        s = s.strip()
        # Skip very short sentences (likely artifacts)
        if len(s) > 20 and not re.match(r'^[\d\s\.\-]+$', s):
            sents.append(s)
    
    if len(sents) > MAX_SENTENCES:
        st.warning(f"Document has {len(sents)} sentences. Using first {MAX_SENTENCES} for analysis.")
        sents = sents[:MAX_SENTENCES]
    
    return sents

def split_sentences(text: str) -> List[str]:
    """Split into sentences with NLTK fallback to regex-based splitting."""
    # Try NLTK first
    try:
        nltk_download_punkt()
        # Test if tokenizer works
        test_result = sent_tokenize("Test sentence. Another sentence.")
        if len(test_result) >= 2:  # If NLTK works properly
            return split_sentences_nltk(text)
    except Exception as e:
        st.warning(f"NLTK tokenizer failed: {e}. Using alternative sentence splitting.")
    
    # Fall back to regex-based splitting
    return split_sentences_alternative(text)

def color_for_score(score: float) -> str:
    if score >= RED_THRESHOLD:
        return "rgba(255,0,0,0.28)"       # red
    if score >= ORANGE_THRESHOLD:
        return "rgba(255,165,0,0.28)"     # orange
    return "transparent"

def make_highlight_html(sent: str, score: float, src_doc_name: str, src_snippet: str) -> str:
    bg = color_for_score(score)
    tooltip = (
        f"Similarity: {score:.2f} | Source: {src_doc_name or '—'}"
        + (f" | Match: {src_snippet}" if src_snippet else "")
    )
    safe_sent = (
        sent.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
    )
    safe_tooltip = (
        tooltip.replace("&", "&amp;")
               .replace("<", "&lt;")
               .replace(">", "&gt;")
    )
    return f"<span title='{safe_tooltip}' style='background-color:{bg}; padding:2px; border-radius:4px;'>{safe_sent}</span>"

def build_download_html(html_body: str) -> str:
    html = f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>BERT Plagiarism Report</title>
<style>
body {{ font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.6; padding:24px; }}
.badge {{ display:inline-block; padding:4px 8px; border-radius:999px; font-size:12px; margin-right:8px; }}
.badge-red {{ background:#ffe6e6; border:1px solid #f99; }}
.badge-orange {{ background:#fff1e0; border:1px solid #f9c; }}
.code {{ font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }}
section {{ margin-bottom: 24px; }}
</style>
</head>
<body>
<h1>BERT Plagiarism Report</h1>
<p>Highlights:
  <span class="badge badge-red">≥ {RED_THRESHOLD:.2f} (likely copy/near-copy)</span>
  <span class="badge badge-orange">≥ {ORANGE_THRESHOLD:.2f} (likely paraphrase)</span>
</p>
{html_body}
</body>
</html>
    """.strip()
    return html

def navigate_flagged_sentences_fast():
    """Ultra-fast navigation for flagged sentences with improved UI."""
    if not st.session_state.flagged_sentences:
        st.info("No flagged sentences found.")
        return
    
    total_flagged = len(st.session_state.flagged_sentences)
    current_idx = st.session_state.current_flagged_index
    
    # Display current flagged sentence
    if 0 <= current_idx < total_flagged:
        current_flagged = st.session_state.flagged_sentences[current_idx]
        student_sent, score, ref_doc, ref_sent, sent_index = current_flagged
        
        # Compact header
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Flagged", f"#{current_idx + 1}/{total_flagged}")
        col2.metric("Score", f"{score:.3f}")
        col3.metric("Position", f"#{sent_index + 1}")
        col4.metric("Risk", "HIGH" if score >= RED_THRESHOLD else "MED")
        
        # Quick comparison view
        st.markdown("---")
        
        # Color-coded comparison
        if score >= RED_THRESHOLD:
            st.markdown("### 🚨 HIGH RISK - Likely Copy/Near-Copy")
        else:
            st.markdown("### ⚠️ MEDIUM RISK - Likely Paraphrase")
        
        # Side by side with better formatting and improved colors
        col_left, col_right = st.columns(2)
        
        with col_left:
            st.markdown("**🎓 Student Text:**")
            # Use a container for better styling with improved contrast
            with st.container():
                if score >= RED_THRESHOLD:
                    st.markdown(f'<div style="background-color: #fce4ec; padding: 15px; border-left: 5px solid #e91e63; border-radius: 8px; color: #880e4f; font-weight: 500;">{student_sent}</div>', unsafe_allow_html=True)
                else:
                    st.markdown(f'<div style="background-color: #fff8e1; padding: 15px; border-left: 5px solid #ffa000; border-radius: 8px; color: #e65100; font-weight: 500;">{student_sent}</div>', unsafe_allow_html=True)
        
        with col_right:
            st.markdown(f"**📚 Source: {ref_doc.split('.')[0][:20]}...**")
            with st.container():
                st.markdown(f'<div style="background-color: #e8f4fd; padding: 15px; border-left: 5px solid #1976d2; border-radius: 8px; color: #0d47a1; font-weight: 500;">{ref_sent}</div>', unsafe_allow_html=True)
        
        # Navigation with clickable page numbers
        st.markdown("---")
        
        # Create navigation buttons with better styling
        btn_col1, btn_col2, nav_col, btn_col4, btn_col5 = st.columns([1, 1, 3, 1, 1])
        
        with btn_col1:
            if st.button(
                "⏮️ First", 
                disabled=(current_idx == 0), 
                key=f"first_btn_{current_idx}",
                help="Go to first flagged sentence",
                use_container_width=True
            ):
                st.session_state.current_flagged_index = 0
                st.rerun()
        
        with btn_col2:
            if st.button(
                "⏪ Prev", 
                disabled=(current_idx == 0), 
                key=f"prev_btn_{current_idx}",
                help="Go to previous flagged sentence",
                use_container_width=True
            ):
                st.session_state.current_flagged_index = max(0, current_idx - 1)
                st.rerun()
        
        with nav_col:
            # Create clickable page numbers
            st.markdown("**Jump to flagged sentence:**")
            
            # Calculate which page numbers to show (show max 8 at a time for better spacing)
            start_page = max(0, current_idx - 4)
            end_page = min(total_flagged, start_page + 8)
            
            # If we're near the end, adjust start_page
            if end_page - start_page < 8:
                start_page = max(0, end_page - 8)
            
            # Create a clean button layout
            pages_to_show = list(range(start_page, end_page))
            
            # Create columns for page numbers with minimal spacing
            if pages_to_show:
                # Add some spacing
                st.markdown("<div style='margin-top: 10px;'></div>", unsafe_allow_html=True)
                
                # Create columns for buttons
                button_cols = st.columns(len(pages_to_show))
                
                for i, page_num in enumerate(pages_to_show):
                    with button_cols[i]:
                        if page_num == current_idx:
                            # Current page - show as disabled button with different styling
                            st.button(
                                f"**{page_num + 1}**",
                                disabled=True,
                                key=f"current_page_{page_num}",
                                use_container_width=True
                            )
                        else:
                            # Other pages - clickable
                            button_key = f"nav_page_{page_num}_{current_idx}"
                            if st.button(
                                f"{page_num + 1}", 
                                key=button_key,
                                help=f"Go to flagged sentence {page_num + 1}",
                                use_container_width=True
                            ):
                                st.session_state.current_flagged_index = page_num
                                st.rerun()
        
        with btn_col4:
            if st.button(
                "Next ⏩", 
                disabled=(current_idx >= total_flagged - 1), 
                key=f"next_btn_{current_idx}",
                help="Go to next flagged sentence",
                use_container_width=True
            ):
                st.session_state.current_flagged_index = min(total_flagged - 1, current_idx + 1)
                st.rerun()
        
        with btn_col5:
            if st.button(
                "Last ⏭️", 
                disabled=(current_idx >= total_flagged - 1), 
                key=f"last_btn_{current_idx}",
                help="Go to last flagged sentence",
                use_container_width=True
            ):
                st.session_state.current_flagged_index = total_flagged - 1
                st.rerun()

def encode_sentences_efficiently(model, sentences: List[str]) -> torch.Tensor:
    """Encode sentences in batches for better memory management."""
    if not sentences:
        return torch.empty(0, model.get_sentence_embedding_dimension())
    
    embeddings = []
    for i in range(0, len(sentences), BATCH_SIZE):
        batch = sentences[i:i + BATCH_SIZE]
        batch_emb = model.encode(batch, convert_to_tensor=True, show_progress_bar=False)
        embeddings.append(batch_emb)
    
    return torch.cat(embeddings, dim=0)

def get_files_hash(uploaded_files):
    """Generate a hash of uploaded files to detect changes."""
    if not uploaded_files:
        return None
    
    import hashlib
    hasher = hashlib.md5()
    for file in uploaded_files:
        # Reset file pointer and read content
        file.seek(0)
        hasher.update(file.read())
        file.seek(0)  # Reset for later use
    
    return hasher.hexdigest()

def should_reprocess(uploaded_files) -> bool:
    """Check if we need to reprocess files."""
    if not uploaded_files or not st.session_state.cached_results:
        return True
    
    current_hash = get_files_hash(uploaded_files)
    return current_hash != st.session_state.last_file_hash

def display_ai_detection_results(ai_results: Dict, total_sentences: int):
    """Display AI detection analysis results."""
    overall_score = ai_results.get("overall_score", 0)
    high_risk = ai_results.get("high_risk_sentences", 0)
    medium_risk = ai_results.get("medium_risk_sentences", 0)
    method_used = ai_results.get("method", "Unknown")
    
    # AI Detection Metrics
    st.markdown("### 🤖 AI Detection Results")
    col1, col2, col3, col4 = st.columns(4)
    
    col1.metric("AI Probability", f"{overall_score:.1%}")
    col2.metric("High Risk Sentences", f"{high_risk}")
    col3.metric("Medium Risk Sentences", f"{medium_risk}")
    col4.metric("Human-like Sentences", f"{total_sentences - high_risk - medium_risk}")
    
    # Method information
    st.caption(f"Detection method: {method_used}")
    
    # Risk Assessment
    if overall_score > 0.8:
        st.error("🚨 VERY HIGH AI PROBABILITY - Content is very likely AI-generated!")
    elif overall_score > 0.6:
        st.error("⚠️ HIGH AI PROBABILITY - Content is likely AI-generated!")
    elif overall_score > 0.4:
        st.warning("⚠️ MODERATE AI PROBABILITY - Some content may be AI-generated.")
    elif overall_score > 0.2:
        st.info("ℹ️ LOW AI PROBABILITY - Content appears mostly human-written.")
    else:
        st.success("✅ VERY LOW AI PROBABILITY - Content appears human-written.")
    
    # Detailed analysis if available
    if "detailed_analysis" in ai_results:
        with st.expander("🔍 Detailed Analysis", expanded=False):
            details = ai_results["detailed_analysis"]
            patterns = details.get("patterns", {})
            
            st.markdown("**Linguistic Pattern Analysis:**")
            
            col_a, col_b = st.columns(2)
            with col_a:
                if "avg_sentence_length" in patterns:
                    st.metric("Avg Sentence Length", f"{patterns['avg_sentence_length']:.1f} words")
                if "vocab_diversity" in patterns:
                    st.metric("Vocabulary Diversity", f"{patterns['vocab_diversity']:.2%}")
            
            with col_b:
                if "burstiness" in patterns:
                    st.metric("Sentence Variation", f"{patterns['burstiness']:.2f}")
                if "transition_frequency" in patterns:
                    st.metric("Transition Words", f"{patterns['transition_frequency']:.1f}%")
            
            # Show detailed scores if available
            if "detailed_scores" in ai_results:
                st.markdown("**Component Scores:**")
                detailed = ai_results["detailed_scores"]
                for key, value in detailed.items():
                    st.progress(value, text=f"{key.replace('_', ' ').title()}: {value:.2f}")
    
    # Sentence-level analysis if available
    sentence_scores = ai_results.get("sentence_scores", [])
    if sentence_scores and len(sentence_scores) > 0:
        with st.expander("📊 Sentence-Level Analysis", expanded=False):
            st.markdown("**AI Probability by Sentence:**")
            
            # Create a simple visualization
            high_ai_sentences = [(i, score) for i, score in enumerate(sentence_scores) if score > 0.6]
            
            if high_ai_sentences:
                st.markdown("**High AI Probability Sentences:**")
                for i, (sent_idx, score) in enumerate(high_ai_sentences[:10]):  # Show top 10
                    st.markdown(f"**Sentence {sent_idx + 1}:** {score:.1%} AI probability")
            else:
                st.info("No sentences show high AI probability.")
    
    # Additional information
    if "perplexity" in ai_results:
        st.markdown("---")
        col_x, col_y = st.columns(2)
        with col_x:
            st.metric("Perplexity Score", f"{ai_results['perplexity']:.1f}")
        with col_y:
            st.metric("Perplexity Rating", f"{ai_results.get('perplexity_score', 0):.1%}")
        
        st.caption("Lower perplexity may indicate more predictable (AI-like) text.")
    
    # Download option for AI analysis
    if st.button("⬇️ Download AI Analysis Report"):
        report_data = generate_ai_report(ai_results, total_sentences)
        st.download_button(
            "Download Report",
            data=report_data,
            file_name="ai_detection_report.json",
            mime="application/json"
        )

def generate_ai_report(ai_results: Dict, total_sentences: int) -> str:
    """Generate a downloadable AI analysis report."""
    import json
    from datetime import datetime
    
    report = {
        "analysis_date": datetime.now().isoformat(),
        "total_sentences": total_sentences,
        "method_used": ai_results.get("method", "Unknown"),
        "overall_ai_probability": ai_results.get("overall_score", 0),
        "high_risk_sentences": ai_results.get("high_risk_sentences", 0),
        "medium_risk_sentences": ai_results.get("medium_risk_sentences", 0),
        "sentence_scores": ai_results.get("sentence_scores", []),
        "detailed_analysis": ai_results.get("detailed_analysis", {}),
        "additional_metrics": {
            k: v for k, v in ai_results.items() 
            if k not in ["sentence_scores", "detailed_analysis", "available", "error"]
        }
    }
    
    return json.dumps(report, indent=2)

# --------- App UI ---------
st.title("📑 Academic Integrity Checker - Plagiarism & AI Detection")
st.caption("Comprehensive tool for detecting plagiarism and AI-generated content")

# Sidebar Navigation
with st.sidebar:
    st.markdown("## 🎯 Choose Analysis Mode")
    
    analysis_mode = st.radio(
        "Select Analysis Type:",
        ["📄 Direct Plagiarism Checker", "🤖 AI Content Detection"],
        help="Choose between plagiarism detection or AI content analysis"
    )
    
    st.markdown("---")
    
    if analysis_mode == "📄 Direct Plagiarism Checker":
        st.markdown("### ⚙️ Plagiarism Settings")
        
        # Model selection
        available_models = get_available_models()
        selected_model_name = st.selectbox(
            "Sentence-BERT Model:",
            options=list(available_models.keys()),
            help="Different models offer trade-offs between speed and quality"
        )
        selected_model = available_models[selected_model_name]
        
        # Thresholds
        RED_THRESHOLD = st.slider("High Risk Threshold", 0.50, 0.99, 0.85, 0.01, help="Likely copy/near-copy")
        ORANGE_THRESHOLD = st.slider("Medium Risk Threshold", 0.50, RED_THRESHOLD, 0.70, 0.01, help="Likely paraphrase")
        MAX_SENTENCES = st.number_input("Max Sentences", 500, 10000, 5000, 100, help="Safety limit for processing")
        
        # View mode selection
        view_mode = st.radio(
            "Display Mode:",
            ["Navigate Flagged", "Full Document", "Both Views"],
            help="Choose how to view results"
        )
        
    else:  # AI Content Detection
        st.markdown("### 🤖 AI Detection Settings")
        
        # AI Detection Method Selection
        available_methods = ai_detector.get_available_methods()
        
        method_options = {}
        for key, info in available_methods.items():
            if info["available"]:
                method_options[info['name']] = key
        
        if not method_options:
            st.error("No AI detection methods available.")
        else:
            selected_method_display = st.selectbox(
                "Detection Method:",
                options=list(method_options.keys()),
                help="Choose AI detection approach"
            )
            selected_method = method_options[selected_method_display]
            
            # Method-specific configuration
            method_info = available_methods[selected_method]
            
            if method_info.get("requires_internet"):
                st.info("🌐 Requires internet")
            if method_info.get("requires_api_key"):
                st.warning("🔑 API key needed")
            
            # Store method config in session state
            if 'ai_method_config' not in st.session_state:
                st.session_state.ai_method_config = {}
            
            if selected_method == "pretrained":
                model_choices = ai_detector.get_model_choices()
                selected_ai_model = st.selectbox(
                    "Pre-trained Model:",
                    options=list(model_choices.keys())
                )
                st.session_state.ai_method_config = {
                    "model_choice": model_choices[selected_ai_model]
                }
                
                # Show performance information
                with st.expander("🚀 Performance Info", expanded=False):
                    perf_info = ai_detector.get_performance_info()
                    for key, value in perf_info.items():
                        st.text(f"{key}: {value}")
                
            elif selected_method == "gptzero_api":
                api_key = st.text_input(
                    "GPTZero API Key:",
                    type="password",
                    help="Get your key from https://gptzero.me/api"
                )
                st.session_state.ai_method_config = {"api_key": api_key}
                
            elif selected_method == "custom_api":
                api_url = st.text_input(
                    "API Endpoint:",
                    placeholder="https://your-api.com/detect"
                )
                api_key = st.text_input(
                    "API Key (optional):",
                    type="password"
                )
                st.session_state.ai_method_config = {
                    "api_url": api_url,
                    "api_key": api_key
                }
            else:
                st.session_state.ai_method_config = {}
    
    st.markdown("---")
    st.markdown("### 📁 File Upload")

# File upload based on analysis mode
if analysis_mode == "📄 Direct Plagiarism Checker":
    uploaded_files = st.file_uploader(
        "Upload PDFs (first = student doc, rest = references):",
        type=["pdf"],
        accept_multiple_files=True,
        help="First PDF is the document to check, others are reference documents"
    )
else:
    uploaded_files = st.file_uploader(
        "Upload PDF to check for AI content:",
        type=["pdf"],
        accept_multiple_files=False,
        help="Upload the document you want to analyze for AI-generated content"
    )
    # Convert single file to list for consistency
    if uploaded_files:
        uploaded_files = [uploaded_files]

# Main processing logic based on analysis mode
if analysis_mode == "📄 Direct Plagiarism Checker":
    # Plagiarism Detection Mode
    if uploaded_files and len(uploaded_files) >= 2:
        # Check if we can use cached results
        needs_reprocessing = should_reprocess(uploaded_files)
        
        if needs_reprocessing:
            # Reset processing state when new files are uploaded
            st.session_state.current_flagged_index = 0
            st.session_state.flagged_sentences = []
            st.session_state.processing_complete = False
            
            # Load model from sidebar selection
            model = load_model(selected_model)

            # Read PDFs
            with st.spinner("Extracting text from PDFs..."):
                main_pdf = uploaded_files[0]
                main_name = getattr(main_pdf, "name", "Student_Document.pdf")
                main_text = read_pdf(main_pdf)

                ref_files = uploaded_files[1:]
                ref_names = [getattr(f, "name", f"Reference_{i+1}.pdf") for i, f in enumerate(ref_files)]
                ref_texts = [read_pdf(f) for f in ref_files]

            # Split to sentences
            with st.spinner("Splitting into sentences..."):
                main_sents = split_sentences(main_text)
                ref_sents = []
                ref_idx = []  # track which reference doc each sentence came from
                for doc_i, t in enumerate(ref_texts):
                    sents = split_sentences(t)
                    ref_sents.extend(sents)
                    ref_idx.extend([doc_i] * len(sents))

            if not main_sents:
                st.warning("Couldn't extract sentences from the student document.")
                st.stop()
            if not ref_sents:
                st.warning("Couldn't extract sentences from the reference documents.")
                st.stop()

            # Limit processing for safety
            if len(main_sents) > MAX_SENTENCES:
                st.warning(f"Document too long. Processing first {MAX_SENTENCES} sentences for safety.")
                main_sents = main_sents[:MAX_SENTENCES]

            st.info(f"Processing {len(main_sents)} student sentences against {len(ref_sents)} reference sentences...")

            # Embeddings with efficient batching
            with st.spinner("Encoding sentences with Sentence-BERT... (first run may download the model)"):
                main_emb = encode_sentences_efficiently(model, main_sents)
                ref_emb = encode_sentences_efficiently(model, ref_sents)

            # Similarities
            with st.spinner("Computing similarities..."):
                # For each student sentence, get best match among all reference sentences
                sim = util.cos_sim(main_emb, ref_emb)  # shape: [len(main_sents), len(ref_sents)]
                best_scores = sim.max(dim=1).values.cpu().numpy()  # [N_main]
                best_idx = sim.argmax(dim=1).cpu().numpy()         # indices into ref_sents

            # Build highlights and score
            highlighted_fragments = []
            flagged_rows: List[Tuple[str, float, str, str, int]] = []  # (student_sentence, score, ref_doc_name, ref_sentence, sentence_index)

            red_count = 0
            orange_count = 0
            for i, sent in enumerate(main_sents):
                score = float(best_scores[i])
                ref_sent = ref_sents[int(best_idx[i])]
                ref_doc_name = ref_names[int(ref_idx[int(best_idx[i])])]
                
                if score >= RED_THRESHOLD:
                    red_count += 1
                elif score >= ORANGE_THRESHOLD:
                    orange_count += 1

                highlighted_fragments.append(
                    make_highlight_html(sent, score, ref_doc_name, ref_sent)
                )
                if score >= ORANGE_THRESHOLD:
                    flagged_rows.append((sent, score, ref_doc_name, ref_sent, i))

            # Store results in cache and session state
            st.session_state.flagged_sentences = sorted(flagged_rows, key=lambda x: x[1], reverse=True)
            st.session_state.processing_complete = True
            st.session_state.last_file_hash = get_files_hash(uploaded_files)
            st.session_state.cached_results = {
                'highlighted_fragments': highlighted_fragments,
                'red_count': red_count,
                'orange_count': orange_count,
                'total': len(main_sents),
                'ref_names': ref_names
            }
            
            st.success("✅ Processing complete! Results are now cached for faster navigation.")
        
        else:
            # Use cached results
            st.info("🚀 Using cached results - navigation will be lightning fast!")
            cached = st.session_state.cached_results
            highlighted_fragments = cached['highlighted_fragments']
            red_count = cached['red_count']
            orange_count = cached['orange_count']
            total = cached['total']
        
        # Display results (same for both cached and fresh)
        cached = st.session_state.cached_results
        total = cached['total']
        red_count = cached['red_count']
        orange_count = cached['orange_count']
        highlighted_fragments = cached['highlighted_fragments']
        
        plag_fraction = (red_count + orange_count) / max(1, total)
        
        # Metrics display
        st.markdown("### 📊 Plagiarism Analysis Results")
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Overall Plagiarism Score", f"{plag_fraction:.2%}")
        col2.metric("High Risk (Red)", f"{red_count}")
        col3.metric("Medium Risk (Orange)", f"{orange_count}")
        col4.metric("Total Sentences", f"{total}")

        # Risk assessment
        if plag_fraction > 0.3:
            st.error("⚠️ HIGH PLAGIARISM RISK detected!")
        elif plag_fraction > 0.1:
            st.warning("⚠️ MODERATE PLAGIARISM RISK detected.")
        else:
            st.success("✅ LOW PLAGIARISM RISK detected.")

        st.markdown("---")

        # Display based on selected view mode
        if view_mode == "Navigate Flagged":
            st.markdown("### 🔍 Navigate Flagged Sentences")
            navigate_flagged_sentences_fast()
            
        elif view_mode == "Full Document":
            st.markdown("### 📄 Full Highlighted Document")
            st.caption("Hover over highlighted text to see similarity scores and source matches.")
            html_body = "<p>" + " ".join(highlighted_fragments) + "</p>"
            st.markdown(html_body, unsafe_allow_html=True)

            # Downloadable HTML report
            report_html = build_download_html(html_body)
            st.download_button(
                "⬇️ Download HTML Report",
                data=report_html,
                file_name="bert_plagiarism_report.html",
                mime="text/html"
            )
        
        else:  # Both Views
            tab1, tab2 = st.tabs(["🔍 Navigate Flagged", "📄 Full Document"])
            
            with tab1:
                navigate_flagged_sentences_fast()
            
            with tab2:
                st.caption("Hover over highlighted text to see similarity scores and source matches.")
                html_body = "<p>" + " ".join(highlighted_fragments) + "</p>"
                st.markdown(html_body, unsafe_allow_html=True)

                # Downloadable HTML report
                report_html = build_download_html(html_body)
                st.download_button(
                    "⬇️ Download HTML Report",
                    data=report_html,
                    file_name="bert_plagiarism_report.html",
                    mime="text/html"
                )

    else:
        st.info("� Upload at least **2 PDFs** — the first is checked against the others.")
        
        # Reset session state when no files are uploaded
        if uploaded_files is None or len(uploaded_files) < 2:
            st.session_state.processing_complete = False
            st.session_state.current_flagged_index = 0
            st.session_state.flagged_sentences = []
            st.session_state.cached_results = None
            st.session_state.last_file_hash = None

else:
    # AI Content Detection Mode
    if uploaded_files and len(uploaded_files) >= 1:
        st.markdown("### 🤖 AI Content Detection Analysis")
        
        # Get method configuration from session state
        method_config = st.session_state.get('ai_method_config', {})
        
        # Validation based on method
        can_analyze = True
        error_message = ""
        
        if selected_method == "gptzero_api" and not method_config.get("api_key"):
            can_analyze = False
            error_message = "GPTZero API key is required."
        elif selected_method == "custom_api" and not method_config.get("api_url"):
            can_analyze = False
            error_message = "Custom API URL is required."
        
        if can_analyze:
            if st.button("🚀 Analyze for AI Content", type="primary", use_container_width=True):
                with st.spinner(f"Analyzing content with {selected_method_display}..."):
                    # Get the document text and sentences
                    main_pdf = uploaded_files[0]
                    main_text = read_pdf(main_pdf)
                    main_sents = split_sentences(main_text)
                    
                    if not main_text or not main_sents:
                        st.error("Could not extract text from the PDF. Please check the file.")
                    else:
                        # Run AI detection
                        ai_results = ai_detector.analyze_ai_content(
                            main_text, 
                            main_sents, 
                            method=selected_method,
                            **method_config
                        )
                        
                        # Display results
                        if ai_results.get("available", False):
                            display_ai_detection_results(ai_results, len(main_sents))
                        else:
                            st.error(f"AI detection failed: {ai_results.get('error', 'Unknown error')}")
        else:
            st.error(error_message)
            st.info("Please configure the required settings in the sidebar.")
    
    else:
        st.info("📁 Upload a PDF document to analyze for AI-generated content.")
