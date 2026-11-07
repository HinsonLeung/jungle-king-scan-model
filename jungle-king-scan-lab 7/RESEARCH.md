# Jungle King animal-card research

Sources checked **9 October 2026**. The eight game names and piece artwork come from the two screenshots supplied by the user. The Kickstarter URL yielded the campaign title, “Jungle King | Recrafted Asian Animal Chess with Modern Play,” but not its full body. Product specifications, board layout, package contents, and modern game rules could not be audited from that response and have not been invented.

The cards use original educational summaries with links to the supporting organisations. There is no paid conservation API, automatic data scraping, or copied conservation-site imagery. Supplied campaign screenshots are preserved as image files and displayed in bounded CSS frames; these assets are not recognition-training photographs or 3D models.

## Animal identities and category scopes

| Game piece | Identity used | Main card category | Scope and additional context |
| --- | --- | --- | --- |
| Asian Elephant | *Elephas maximus* | Endangered | Global species. No particular elephant subspecies is assumed. |
| West African Lion | *Panthera leo*, West African population | Critically Endangered | Regional population. Global lion category: Vulnerable. |
| Malayan Tiger | *Panthera tigris*, Malayan population | Critically Endangered | WWF-Malaysia's reported category for the Malayan tiger. Global tiger: Endangered. Traditional name *P. t. jacksoni* is explained; taxonomy is under review. |
| Indochinese Leopard | *Panthera pardus delacouri* | Critically Endangered | Subspecies. Global leopard: Vulnerable. |
| Formosan Black Bear | *Ursus thibetanus formosanus* | Vulnerable | Global Asiatic black bear species category. Taiwan population: Nationally Endangered, 2024. |
| African Wild Dog | *Lycaon pictus* | Endangered | Global species. |
| Leopard Cat | *Prionailurus bengalensis* | Least Concern | Mainland species globally. Taiwan population: Nationally Endangered, 2024, shown as additional context. |
| Aquatic Rat | Provisionally *Arvicola amphibius*, European water vole | Endangered | Great Britain Red List category, conditional on the animal mapping. Global water vole: Least Concern. Designer confirmation is still needed. |

The word “endangered” is not used as a blanket category for all eight animals. National, regional, subspecies, and global assessments are labelled separately. A source-check date is not represented as an IUCN assessment date. Where the original assessment date was not verified, the data preserves `assessmentDate: null` and explains this on the cards. Only separately verified national assessment years are shown.

## Sources

- **Asian elephant:** [WWF species profile](https://www.worldwildlife.org/species/elephant/asian-elephant/) and [WWF elephant facts](https://www.worldwildlife.org/resources/facts/asian-elephants-threats/).
- **West African lion:** [IUCN SSC Cat Specialist Group](https://www.catsg.org/living-species-lions) and [Panthera's West African lion project](https://www.panthera.org/blog/last-lions-of-west-africa).
- **Malayan tiger:** [WWF-Malaysia status](https://www.wwf.org.my/tiger_facts/status_of_malayan_tigers/), [WWF-Malaysia conservation FAQ](https://www.wwf.org.my/%3F30025/Tiger-Frequently-Asked-Questions), and [IUCN SSC Cat Specialist Group taxonomy/global status](https://www.catsg.org/living-species-tiger).
- **Indochinese leopard:** [Panthera's study summary](https://panthera.org/newsroom/panthera-study-finds-indochinese-leopard-functionally-extinct-cambodia-signaling-loss) and [IUCN SSC Cat Specialist Group leopard profile](https://www.catsg.org/living-species-leopard).
- **Formosan black bear:** [Taiwan Forestry and Nature Conservation Agency](https://www.forest.gov.tw/0008045) and [Taiwan Black Bear Conservation Association research](https://www.taiwanbear.org.tw/admin/resource/files/AJ200601-The_status_and_management_of_Asiatic_black_bears_in_Taiwan_Japan_Bear_Network_Press%2C_Japan.pdf). The older research supports identity/background; present category/context comes from the agency profile.
- **African wild dog:** [WWF](https://www.worldwildlife.org/species/african-wild-dog/) and [African Wildlife Foundation](https://www.awf.org/wildlife-conservation/african-wild-dog).
- **Leopard cat:** [IUCN SSC Cat Specialist Group](https://www.catsg.org/living-species-leopardcat) and [Taiwan Forestry and Nature Conservation Agency](https://www.forest.gov.tw/0008043).
- **Water vole, provisional Aquatic Rat identity:** [The Wildlife Trusts species profile](https://www.wildlifetrusts.org/wildlife-explorer/mammals/water-vole), [recovery projects](https://www.wildlifetrusts.org/water-voles), and [PTES Wildlife World fact file, PDF page 8](https://ptes.org/wp-content/uploads/2024/10/WW26-full-for-web.pdf#page=8).

## Website additions

Current implementation, reviewed 14 October 2026: eight sourced animal cards revealed only by a matched QR, demo or trained-model result; original game artwork from the supplied screenshots; habitats, threats, protection, and facts; linked sources; checked dates; assessment scopes; a visible provisional mapping; and a campaign link. The earlier browsing/search gallery, filters and manual card-opening paths were removed to keep the scanner as the entry point. Describing them as current features was stale.

Traditional Chinese card translations were added on 14 October 2026 in `dist/content.js`, preserving the global/regional distinctions and provisional water-vole identity. The external sources were not freshly audited during this software review: their original 9 October check dates remain. Final bilingual editorial review and designer confirmation are still needed.

Further campaign-dependent additions can include a verified rules guide, package contents, dimensions, board diagram, and product-source 3D assets once the relevant campaign text or designer material is available. A generated tiger GLB is now connected as a clearly labelled test placeholder. Final 3D assets, physical-product training and real-device AR verification remain separate work.

## Content maintenance

The `reviewed` flag means the educational text was checked against the listed sources in this research pass. It is not an expert certification or designer approval. `mappingStatus: provisional` remains visible even when the water-vole content is sourced. Confirm the Aquatic Rat identity before presenting it as an established species mapping. Recheck sources and dates when updating the profiles. Do not assign a new category solely from a promotional label or an undated population estimate.
