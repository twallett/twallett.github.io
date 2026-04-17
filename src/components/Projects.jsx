// src/components/ProjectsGrid.jsx
import React, { useState } from "react";
import { projects } from "../data/cards";
import { Github, ExternalLink } from "lucide-react";

const PROJECTS_PER_PAGE = 9;

function ProjectCard({ project, theme }) {
  const isDark = theme === "dark";

  return (
    <div className={`overflow-hidden rounded-xl border transition-all hover:shadow-xl ${
      isDark
        ? "border-slate-700 bg-slate-800 hover:border-slate-600"
        : "border-slate-200 bg-white hover:border-slate-300"
    }`}>
      <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
        {/* Blurred background */}
        <img
          src={project.image}
          alt=""
          style={{ 
            position: 'absolute',
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
            opacity: 0.3
          }}
        />
        {/* Sharp foreground image */}
        <img
          src={project.image}
          alt={project.name}
          style={{ 
            position: 'relative',
            width: '100%', 
            height: '200px', 
            objectFit: 'contain'
          }}
          className="hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-6">
        <h3 className={`mb-2 text-xl font-semibold ${
          isDark ? "text-white" : "text-slate-900"
        }`}>{project.name}</h3>
        <p className={`mb-4 text-sm ${
          isDark ? "text-slate-400" : "text-slate-600"
        }`}>{project.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                isDark
                  ? "bg-slate-700 text-slate-300"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex gap-3 flex-wrap">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[120px] bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Github size={16} />
              GitHub
            </a>
          )}
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink size={16} />
              Live Demo
            </a>
          )}
          {project.website && (
            <a
              href={project.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink size={16} />
              Website
            </a>
          )}
          {project.research && (
            <a
              href={project.research}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[120px] bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink size={16} />
              Research
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Projects({ theme = "light" }) {
  const [selectedTag, setSelectedTag] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const isDark = theme === "dark";

  // Get all unique tags
  const allTags = [
    "All",
    ...new Set(projects.flatMap((project) => project.tags))
  ];

  const filteredProjects =
    selectedTag === "All"
      ? projects
      : projects.filter((project) => project.tags.includes(selectedTag));
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE));
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * PROJECTS_PER_PAGE,
    currentPage * PROJECTS_PER_PAGE
  );

  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const projectsSection = document.getElementById("projects");
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div id="projects" className={`min-h-screen py-16 transition-colors duration-300 ${
      isDark ? "bg-slate-900" : "bg-slate-50"
    }`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className={`mb-3 text-3xl font-bold ${
            isDark ? "text-white" : "text-slate-950"
          }`}>My Project Portfolio</h2>
          <p className={`mx-auto mb-6 max-w-2xl ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}>
            A curated collection of my recent work across different technologies and domains
          </p>
          <div className="flex justify-center flex-wrap gap-2 mt-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagSelect(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedTag === tag
                    ? "bg-blue-600 text-white"
                    : isDark
                      ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      : "bg-white text-slate-700 hover:bg-slate-100"
                } transition-colors`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} theme={theme} />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                currentPage === 1
                  ? isDark
                    ? "cursor-not-allowed bg-slate-800 text-slate-500"
                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                  : isDark
                    ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                    : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`h-10 w-10 rounded-full text-sm font-semibold transition-colors ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : isDark
                        ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                        : "bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                  aria-label={`Go to page ${page}`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? isDark
                    ? "cursor-not-allowed bg-slate-800 text-slate-500"
                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                  : isDark
                    ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                    : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
