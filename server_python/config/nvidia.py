"""
Nvidia NIM OpenAI-compatible client.
"""
import os
from openai import OpenAI

_client: OpenAI | None = None


def get_nvidia_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=os.environ["NVIDIA_API_KEY"],
            base_url="https://integrate.api.nvidia.com/v1",
        )
    return _client
