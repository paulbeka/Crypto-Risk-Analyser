import streamlit as st
from utils.state import initialize_state
from services.api import fetch_risk_analysis

st.set_page_config(
    page_title="Crypto Risk Dashboard",
    layout="wide",
)

initialize_state()

st.title("Crypto Portfolio Risk Analyzer")
st.write("Enter your crypto holdings below to analyze portfolio risk.")

st.divider()

if "assets" not in st.session_state:
    st.session_state.assets = [{"ticker": "", "amount": 0.0}]

for i, asset in enumerate(st.session_state.assets):
    col1, col2, col3 = st.columns([3, 2, 1])

    asset["ticker"] = col1.text_input(
        "Ticker",
        value=asset["ticker"],
        key=f"ticker_{i}",
        placeholder="BTC, ETH..."
    )

    asset["amount"] = col2.number_input(
        "Amount",
        min_value=0.0,
        value=float(asset["amount"]),
        key=f"amount_{i}"
    )

    if col3.button("Remove", key=f"remove_{i}"):
        st.session_state.assets.pop(i)
        st.rerun()

if st.button("Add another asset"):
    st.session_state.assets.append({"ticker": "", "amount": 0.0})
    st.rerun()

st.divider()

if st.button("Analyze Portfolio", use_container_width=True):
    valid_assets = [
        a for a in st.session_state.assets
        if a["ticker"] and a["amount"] > 0
    ]

    if not valid_assets:
        st.warning("Please enter at least one valid asset.")
    else:
        with st.spinner("Analyzing portfolio risk..."):
            results = fetch_risk_analysis(valid_assets)
            st.session_state.analysis_results = results

        st.switch_page("pages/1_Risk_Analysis.py")