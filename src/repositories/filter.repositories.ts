SELECT 
    cta.name AS atributo,
    ia.value AS valor
FROM item i
JOIN sub_category sc ON i.sub_category_id = sc.id
JOIN category c ON sc.category_id = c.id
JOIN category_type ct ON c.category_type_id = ct.id
JOIN item_attribute ia ON i.id = ia.item_id
JOIN category_type_attribute cta ON ia.category_type_attribute_id = cta.id
WHERE ct.name = 'Equipo'  -- Reemplazar con el tipo deseado
AND c.name = 'Desktop'    -- Reemplazar con la categoría deseada
ORDER BY cta.name;


import { getRepository } from "typeorm";
import { Item } from "../entities/Item";

async function getItemAttributesByTypeAndCategory(type: string, category: string) {
    const itemRepo = getRepository(Item);

    const sql = `
        SELECT 
            cta.name AS atributo,
            ia.value AS valor
        FROM item i
        JOIN sub_category sc ON i.sub_category_id = sc.id
        JOIN category c ON sc.category_id = c.id
        JOIN category_type ct ON c.category_type_id = ct.id
        JOIN item_attribute ia ON i.id = ia.item_id
        JOIN category_type_attribute cta ON ia.category_type_attribute_id = cta.id
        WHERE ct.name = $1
        AND c.name = $2
        ORDER BY cta.name;
    `;

    const params = [type, category];

    return await itemRepo.query(sql, params);
}
