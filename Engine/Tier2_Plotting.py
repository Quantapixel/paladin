import numpy as np
from sentence_transformers import SentenceTransformer
import pandas as pd

mpropmts_df=pd.read_csv("malicious_prompts_data.csv")
MAL_PROMPTS=mpropmts_df["prompt"].tolist()  # list of malicious prompts

print(f"encoding {len(MAL_PROMPTS)} prompts...")

model=SentenceTransformer("all-MiniLM-L6-v2")

# normalize_embeddings makes strings into unit vectors of 384 hyperparameters:
vector_embedding=model.encode(MAL_PROMPTS,normalize_embeddings=True,show_progress_bar=True)

np.save("embedded_mal_prompts.npy",vector_embedding)
print("\ndone")