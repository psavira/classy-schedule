import React, { useEffect, useState } from "react"



const Courses = () => {
    const [courses, setCourses] = useState(<p>Waiting...</p>)
    useEffect(() => {
        const fetchData = async () => {
            let newCourses = await fetch('/api/courses')
                .then(res => {
                    return res.json()
                })
                .then(json => {
                    return json.map((item, index) => {
                        return <p key={index}>{item.class_name} [{item.course_number}]</p>
                    })
                })
                .catch(err => {
                    return <h1>Error: {err.message}</h1>
                })
            console.log(newCourses)
            setCourses(newCourses)
        }

        fetchData()
        
    }, []);

    return (
        <div>
            <h1>Courses</h1>
            {courses}
        </div>
    )
}

export default Courses