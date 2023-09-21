import { useGetUsersQuery } from "./usersApiSlice"
import User from "./User"

const UsersList = () => {

  const {
    data:users,
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetUsersQuery( undefined, {
    pollingInterval: 60000, // refetching every 60 seconds {we kept it less than that of Notes}
    refetchOnFocus: true, // if we are on some other page and we come back to it, we want to refetch the data
    refetchOnMountOrArgChange: true // refething on mount
  });

  let content;

  if(isLoading)
    content = <p>Loading...</p>

  if(isError)
    content = <p className = "errmsg"> {error?.data?.message}</p>
  
  if(isSuccess){
    
    const { ids } = users;

    const tableContent = ids?.length && ids.map(userId => <User key={userId} userId={userId} />)
    
    content = (
      <table className="table table--users">
        <thead className="table__thead">
          <tr>
            <th scope="col" className="table__th user__username">Username</th>
            <th scope="col" className="table__th user__roles">Roles</th>
            <th scope="col" className="table__th user__edit">Edit</th>
          </tr>
        </thead>
        <tbody>
          {tableContent}
        </tbody>
      </table>
    )
  }
  return content
}

export default UsersList