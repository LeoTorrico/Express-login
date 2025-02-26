import { getRepository } from "typeorm";
import { Item } from "../entities/Item";
import { ItemAttribute } from "../entities/ItemAttribute";
import { CategoryType } from "../entities/CategoryType";
import { Category } from "../entities/Category";
import { CategoryTypeAttribute } from "../entities/CategoryTypeAttribute";

async function getFilteredItems(type: string, category: string, details: Record<string, string>) {
    const itemRepo = getRepository(Item);

    const query = itemRepo
        .createQueryBuilder("item")
        .innerJoin("item.subCategory", "subCategory")
        .innerJoin("subCategory.category", "category")
        .innerJoin("category.categoryType", "categoryType")
        .innerJoin("item.itemAttributes", "itemAttribute")
        .innerJoin("itemAttribute.categoryTypeAttribute", "categoryTypeAttribute")
        .where("categoryType.name = :type", { type })
        .andWhere("category.name = :category", { category });

    // Filtrar por cada detalle (Procesador, Memoria RAM, etc.)
    const detailsConditions = Object.entries(details).map(([key, value], index) => {
        return `(categoryTypeAttribute.name = :key${index} AND itemAttribute.value = :value${index})`;
    });

    if (detailsConditions.length > 0) {
        query.andWhere(`(${detailsConditions.join(" OR ")})`, Object.fromEntries(
            Object.entries(details).flatMap(([key, value], index) => [
                [`key${index}`, key],
                [`value${index}`, value]
            ])
        ));
    }

    query.groupBy("item.id")
        .having(`COUNT(DISTINCT categoryTypeAttribute.id) = :detailsCount`, { detailsCount: Object.keys(details).length });

    return query.getMany();
}


const type = "Equipo";
const category = "Computadora de escritorio";
const details = {
    "Procesador": "i7",
    "Memoria RAM": "32Gb"
};

getFilteredItems(type, category, details).then(items => {
    console.log(items);
});



import { getRepository } from "typeorm";
import { Item } from "../entities/Item";

async function getFilteredItemsRaw(type: string, category: string, details: Record<string, string>) {
    const itemRepo = getRepository(Item);

    // Construcción dinámica de filtros para los detalles
    const detailConditions = Object.entries(details).map(([key, value], index) => {
        return `(cta_sub.name = $${index * 2 + 3} AND ia_sub.value = $${index * 2 + 4})`;
    }).join(" OR ");

    const sql = `
        SELECT i.*
        FROM item i
        JOIN sub_category sc ON i.sub_category_id = sc.id
        JOIN category c ON sc.category_id = c.id
        JOIN category_type ct ON c.category_type_id = ct.id
        JOIN item_attribute ia ON i.id = ia.item_id
        JOIN category_type_attribute cta ON ia.category_type_attribute_id = cta.id
        WHERE ct.name = $1
        AND c.name = $2
        AND EXISTS (
            SELECT ia_sub.item_id
            FROM item_attribute ia_sub
            JOIN category_type_attribute cta_sub ON ia_sub.category_type_attribute_id = cta_sub.id
            WHERE ia_sub.item_id = i.id
            AND (${detailConditions})
            GROUP BY ia_sub.item_id
            HAVING COUNT(DISTINCT cta_sub.id) = $${Object.keys(details).length * 2 + 3}
        )
        GROUP BY i.id
    `;

    const params = [
        type,
        category,
        ...Object.entries(details).flatMap(([key, value]) => [key, value]),
        Object.keys(details).length
    ];

    return await itemRepo.query(sql, params);
}
