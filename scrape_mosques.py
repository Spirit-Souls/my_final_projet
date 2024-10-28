import requests
from bs4 import BeautifulSoup
import json

# URL de la page Wikipédia
url = "https://fr.wikipedia.org/wiki/Liste_de_mosqu%C3%A9es_de_France"
response = requests.get(url)
soup = BeautifulSoup(response.text, "html.parser")

# Liste pour stocker les données des mosquées
mosques = []
id_counter = 1  # Compteur pour l'identifiant unique

# Extraction des données de chaque table "wikitable"
for table in soup.select("table.wikitable"):
    for row in table.select("tbody tr"):
        cells = row.find_all("td")
        if len(cells) >= 4:  # Vérifie qu'il y a bien 4 colonnes dans la ligne
            # Extrait le nom de la mosquée et la commune (ville)
            name = cells[0].get_text(strip=True)
            city = cells[2].get_text(strip=True)  # Utilise la troisième colonne pour la ville
            mosques.append({"id": id_counter, "name": name, "city": city, "country": "France"})
            id_counter += 1

# Sauvegarde des données dans un fichier JSON
with open("mosques_france.json", "w", encoding="utf-8") as f:
    json.dump(mosques, f, ensure_ascii=False, indent=4)

print("Extraction terminée et sauvegardée dans 'mosques_france.json'")
