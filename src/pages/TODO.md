# Add Subcategory Filter to Products Page

## Information Gathered:
- Products.jsx has category filter (`categoryFilter`)
- Has `subcategories` state & fetchSubcategoriesList()
- Filter row: search + category dropdown + low stock button
- useEffect watches `[search, showLowStock, categoryFilter]`
- fetchProducts adds `params.category`

## Plan:
1. Add `subcategoryFilter` state
2. Add filteredSubcategories logic (category-dependent)
3. Add subcategory dropdown in filter row
4. Update useEffect + fetchProducts to use subcategoryFilter
5. Style to match existing filters

## Dependent Files:
Frontend/src/pages/Products.jsx

## Followup:
- Test filtering works
- Backend supports subcategory param

Ready to proceed? Confirm or adjust plan.

