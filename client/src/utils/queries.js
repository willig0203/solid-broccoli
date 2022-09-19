export const QUERY_ME = gql`
{
  me {
    _id
    username
    email
    bookCount
    savedBooks {
  }
}
`;
