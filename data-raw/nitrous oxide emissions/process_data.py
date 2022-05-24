import json
from itertools import chain
import pandas as pd

if __name__ == "__main__":
    meta = {
        "source" : "World Bank",
        "date" : "",
        "title" : "Nitrous Oxide Emissions",
        "url" : "https://data.worldbank.org/indicator/EN.ATM.NOXE.KT?end=2018&start=1960&view=chart",
        "units" : "kt",
        "years" : [1970, 2019]
    }

    data = []
    csv = pd.read_csv("./API_EN.ATM.NOXE.KT.CE_DS2_en_csv_v2_3016455.csv", skiprows=4)

    for idx, row in csv.iterrows():
        row_data = {}
        rel_keys = ["Country Code", "Country Name"]

        for key in chain(rel_keys, range(1970, 2021)):
            val = row[str(key)]
            # needed or else these vals will be NaN in json, which is invalid
            row_data[key] = val if pd.notna(val) else None 

        data.append(row_data)

    json_str = json.dumps({"meta": meta, "data": data}, indent=4, allow_nan=False)
    with open("./data.json", "w") as f:
        f.write(json_str)

