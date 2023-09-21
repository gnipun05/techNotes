import {
    createSelector, 
    createEntityAdapter,
} from '@reduxjs/toolkit';

import { apiSlice } from '../../app/api/apiSlice';

const usersAdapter = createEntityAdapter({});

const initialState = usersAdapter.getInitialState();

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getUsers: builder.query({
            query: () => '/users',
            validateStatus: (response, result) => {
                return response.status === 200 & !result.isError
            }, 
            // keepUnusedDataFor: 5, // 5 seconds
            transformResponse: responseData => { // responseData is the Data we are getting from the above query
                const loadedUsers = responseData.map(user => {
                    user.id=user._id;
                    return user;
                });
                return usersAdapter.setAll(initialState, loadedUsers); // setAll is a method of the usersAdapter to set the state with the loadedUsers
            },
            providesTags: (result, error, arg) => {
                if(result?.ids){
                    return [
                        {type: 'User', id: 'LIST'},
                        ...result.ids.map(id => ({type: 'User', id}))
                    ]
                }
                else{
                    return [{type: 'User', id: 'LIST'}]
                }
            }
        }),
        addNewUser: builder.mutation({
            query: initialUserData => ({
                url: '/users',
                method: 'POST',
                body: {
                    ...initialUserData
                }
            }),
            invalidatesTags: [{type: 'User', id: 'LIST'}]
        }),
        updateUser: builder.mutation({
            query: initialUserData => ({
                url: '/users',
                method: 'PATCH',
                body: {
                    ...initialUserData
                }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'User', id: arg.id }
            ]
        }),
        deleteUser: builder.mutation({
            query: ({id}) => ({
                url: '/users',
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'User', id: arg.id }
            ]
        }),
    })
})

export const {
    useGetUsersQuery,
    useAddNewUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
} = usersApiSlice;

// returns the query result object for the getUsers query
export const selectUsersResult = usersApiSlice.endpoints.getUsers.select();

// creates memoized selector
const selectUsersData = createSelector(
    selectUsersResult,
    usersResult => usersResult.data // normalized state object with ids and entities
)

// getSelectors creates the selectors and we reaname them with aliases using ES6 destructuring
// selectAll, selectById, and selectIds are selectors that are created by getSelectors automatically
// we are just renaming them here
export const {
    selectAll: selectAllUsers,
    selectById: selectUserById,
    selectIds: selectUserIds,
    // pass in a selector that returns the users slice of state
} = usersAdapter.getSelectors(state => selectUsersData(state) ?? initialState);