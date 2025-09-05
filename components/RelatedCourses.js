'use client';

import { useState, useEffect } from 'react';
import { FiTag } from 'react-icons/fi';
import Image from 'next/image';

export default function RelatedCourses({ currentCourse, maxCourses = 3 }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentCourse) {
      fetchRelatedCourses();
    }
  }, [currentCourse]);

  const fetchRelatedCourses = async () => {
    try {
      const query = new URLSearchParams({
        category: currentCourse.category,
        tags: currentCourse.tags.join(','),
        exclude: currentCourse._id,
        limit: maxCourses
      });

      const res = await fetch(`/api/courses/related?${query}`);
      if (!res.ok) throw new Error('Failed to fetch related courses');
      
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Related Courses
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {courses.map((course) => (
          <a
            key={course._id}
            href={`/courses/${course._id}`}
            className="flex flex-col rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="flex-shrink-0 h-32 relative">
              <Image
                src={course.coverImage || '/default-course-cover.jpg'}
                alt={course.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 bg-white p-4">
              <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
                {course.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {course.description.replace(/<[^>]*>/g, '')}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {course.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    <FiTag className="mr-1 h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
