/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/-+/g, '-')       // Replace multiple hyphens with single
        .substring(0, 50)          // Limit length
}

/**
 * Generate a unique slug by appending a number if needed
 */
export async function generateUniqueSlug(
    text: string,
    checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
    let slug = generateSlug(text)
    let counter = 1
    let finalSlug = slug

    while (await checkExists(finalSlug)) {
        finalSlug = `${slug}-${counter}`
        counter++
    }

    return finalSlug
}
