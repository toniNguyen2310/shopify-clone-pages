
export const GET_PAGES_QUERY = `
    {
      pages(first: 20) {
        edges {
          node {
            id
            title
            body
            isPublished
            updatedAt
            templateSuffix
          }
        }
      }
    }
  `;
export const GET_PAGE_QUERY = `
                    query getPage($id: ID!) {
                    page(id: $id) {
                        id  
                        title
                        body
                        handle
                        isPublished
                        publishedAt
                        templateSuffix
                        seoTitle: metafield(namespace: "global", key: "title_tag") {
                        value
                        }
                        seoDescription: metafield(namespace: "global", key: "description_tag") {
                        value
                        }              
                    }
                    }
     `
export const GET_PROXY_PAGE_QUERY = `
        query getPage($id: ID!) {
          page(id: $id) {
            id
            title
            body
            handle
            templateSuffix
          }
        }
      `;

export const UPDATE_PAGE_MUTION = `
            mutation UpdatePage($id: ID!, $page: PageUpdateInput!) {
                pageUpdate(id: $id, page: $page) {
                    page {
                        id
                        title
                        body
                        handle
                        isPublished
                        publishedAt
                        templateSuffix
                    }
                    userErrors {
                        code
                        field
                        message
                    }
                }
            }
`;
export const CREATE_PAGE_MUTATION = `
 mutation pageCreate($page: PageCreateInput!) {
    pageCreate(page: $page) {
    page {
      id
      title
      handle
    }
    userErrors {
      field
      message
    }
  }
}
`;
export const DELETE_PAGE_MUTATION = `
    mutation pageDelete($id: ID!) {
        pageDelete(id: $id) {
            deletedPageId
            userErrors {
                field
                message
                code
            }
        }
    }
`;
export const UPDATE_ISPUBLISH_PAGE_MUTION = `
            mutation UpdatePage($id: ID!, $page: PageUpdateInput!) {
                pageUpdate(id: $id, page: $page) {
                    page {
                        id
                        title
                        isPublished    
                    }
                    userErrors {
                        code
                        field
                        message
                    }
                }
            }
 `;
export const GET_PRODUCT_QUERY = `
    {
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            status
            variants(first: 5) {
              edges {
                node {
                  id
                  price
                }
              }
            }
          }
        }
      }
    }
  `
export const SET_METAFIELDS_MUTATION = `
                mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
                    metafieldsSet(metafields: $metafields) {
                        metafields {
                            id
                            namespace
                            key
                            value
                        }
                        userErrors {
                            field
                            message
                        }
                    }
                }
 `;








