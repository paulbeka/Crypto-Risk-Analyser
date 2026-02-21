import streamlit as st

def initialize_state():
    if "analysis_results" not in st.session_state:
        st.session_state.analysis_results = None