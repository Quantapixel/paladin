import numpy as np
from sentence_transformers import SentenceTransformer
import pandas as pd

###################################################################################################################################################################################################

#TIER 2:

MAL_PROMPTS=np.load("embedded_mal_prompts.npy")
model=SentenceTransformer("all-MiniLM-L6-v2")

def risk_score(u_prompt:str):
    USER_PROMPT=u_prompt

    #normalize_embeddings makes strings into unit vectors of 384 hyperparameters:
    u_vector=model.encode(USER_PROMPT,normalize_embeddings=True)

    #dot pdt:
    all_risks=np.dot(MAL_PROMPTS, u_vector) #for all cos(theta) = (p_bar . r_bar)/(p . r)
    risk_factor=float(max(all_risks))

    risk_score=100*risk_factor

    return risk_score

#Tier 

###################################################################################################################################################################################################