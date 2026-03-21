import requests
from schemas import Portfolio

ALCHEMY_RPC_URL = "https://eth-mainnet.g.alchemy.com/v2/EN3K4upCaZZw4Ybws8RXu"


def rpc_call(method, params):
    payload = {"jsonrpc": "2.0", "id": 1, "method": method, "params": params}
    r = requests.post(ALCHEMY_RPC_URL, json=payload, timeout=30)
    r.raise_for_status()
    data = r.json()
    if "error" in data:
        err = data["error"]
        msg = err.get("message") if isinstance(err, dict) else str(err)
        raise RuntimeError(f"Alchemy RPC error: {msg}")
    return data["result"]


def get_token_metadata(contract_address):
    return rpc_call("alchemy_getTokenMetadata", [contract_address])


def get_eth_balance(address: str):
    eth_balance_hex = rpc_call("eth_getBalance", [address, "latest"])
    return int(eth_balance_hex, 16) / 1e18


def get_token_balances(address: str):
    data = rpc_call("alchemy_getTokenBalances", [address, "DEFAULT_TOKENS"])

    result = []

    eth_balance = get_eth_balance(address)
    if eth_balance > 0:
        result.append({
            "crypto": "ethereum",
            "allocation": eth_balance
        })

    for token in data["tokenBalances"]:
        raw_balance = int(token["tokenBalance"], 16)

        if raw_balance == 0:
            continue

        contract = token["contractAddress"]

        try:
            metadata = get_token_metadata(contract)
        except Exception:
            continue

        decimals = metadata.get("decimals", 18)
        name = metadata.get("name", "Unknown").lower()

        balance = raw_balance / (10 ** decimals)

        result.append(Portfolio(crypto=name, allocation=balance))

    return result