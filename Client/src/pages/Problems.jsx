import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { getProblems, getTopic } from "@/services/problems";
import Navbar from "@/components/Navbar";


export default function ProblemsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [problems, setProblems] = useState([]);
  const [topics, setTopics] = useState(["All"]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();


  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

 
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await getTopic();
        setTopics(["All", ...res.data]);

      } catch (err) {
        console.error("Error fetching topics", err);
      }
    };

    fetchTopics();
  }, []);


  const fetchProblems = async () => {
    try {
      setLoading(true);

      const res = await getProblems({
        params: {
          search: debouncedSearch,
          topic: selectedTopic,
          difficulty,
          page: currentPage,
          limit: 10,
        },
      });

      setProblems(res.data.problems);
      setPagination(res.data.pagination);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [debouncedSearch, selectedTopic, difficulty, currentPage]);

  return (
    <>
    <Navbar/>
    <div className="p-6 space-y-6">
      
      <h1 className="text-3xl font-bold">Problems</h1>

      {/* 🔍 Search */}
      <Input
        placeholder="Search problems..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      {/* 🏷️ Topic Filter */}
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <Button
            key={topic}
            variant={selectedTopic === topic ? "default" : "outline"}
            onClick={() => {
              setSelectedTopic(topic);
              setCurrentPage(1);
            }}
          >
            {topic}
          </Button>
        ))}
      </div>

     
      <div className="flex gap-2">
        {["All", "Easy", "Medium", "Hard"].map((d) => (
          <Button
            key={d}
            variant={difficulty === d ? "default" : "outline"}
            onClick={() => {
              setDifficulty(d);
              setCurrentPage(1);
            }}
          >
            {d}
          </Button>
        ))}
      </div>


      {loading ? (
        <p>Loading...</p>
      ) : problems.length === 0 ? (
        <p>No problems found</p>
      ) : (
        <div className="grid gap-4">
          {problems.map((problem) => (
            <Card key={problem.problemId}>
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">
                    {problem.frontendId}. {problem.title}
                  </h2>
                  <Badge
                    variant={
                      problem.difficulty === "Easy"
                        ? "secondary"
                        : problem.difficulty === "Medium"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {problem.difficulty}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {problem.topics.map((topic) => (
                    <Badge key={topic} variant="outline">
                      {topic}
                    </Badge>
                  ))}
                </div>

                <Button
                  className="w-fit mt-2"
                  onClick={() =>
                    navigate(`/problem/${problem.problemId}`)
                  }
                >
                  Solve
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-2">
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Prev
        </Button>

        <span className="px-4 py-2">
          Page {pagination.page || 1} of {pagination.pages || 1}
        </span>

        <Button
          disabled={!pagination.hasNextPage}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
    </>
  );
}