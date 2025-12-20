// src/components/ProjectsGrid.jsx
import React, { useState } from "react";
import { projects } from "../data/cards";
import { Github, ExternalLink } from "lucide-react";

function ProjectCard({ project }) {
  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-all hover:shadow-xl">
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
        <h3 className="text-xl font-semibold text-white mb-2">{project.name}</h3>
        <p className="text-slate-400 text-sm mb-4">{project.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-medium"
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

export default function Projects() {
  const [selectedTag, setSelectedTag] = useState("All");

  // Get all unique tags
  const allTags = [
    "All",
    ...new Set(projects.flatMap((project) => project.tags))
  ];

  const filteredProjects =
    selectedTag === "All"
      ? projects
      : projects.filter((project) => project.tags.includes(selectedTag));

  return (
    <div id="projects" className="bg-slate-900 py-16 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-3">Selected Projects</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-6">
            A curated collection of my recent work across different technologies and domains
          </p>
          <div className="flex justify-center flex-wrap gap-2 mt-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedTag === tag
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                } transition-colors`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}