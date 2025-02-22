import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Upload, AlertCircle, FileText } from "lucide-react";
import { analyzeTranscript } from "@/lib/api";
import type { Transcript } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const [result, setResult] = useState<Transcript | null>(null);

  const mutation = useMutation({
    mutationFn: analyzeTranscript,
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Analysis Complete",
        description: "The transcript has been successfully analyzed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "text/*": [".txt"],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        mutation.mutate(acceptedFiles[0]);
      }
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        Earnings Transcript Analyzer
      </h1>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-primary"
              }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg text-gray-600">
              {isDragActive
                ? "Drop the file here"
                : "Drag & drop a transcript file, or click to select"}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supported format: .txt (max 5MB)
            </p>
          </div>
        </CardContent>
      </Card>

      {mutation.isPending && (
        <Card>
          <CardHeader>
            <CardTitle>Analyzing Transcript...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      )}

      {result?.analysis && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Financial Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.analysis.revenue && (
                <div>
                  <h3 className="font-semibold">Revenue</h3>
                  <p>{result.analysis.revenue.amount}</p>
                  {result.analysis.revenue.growth && (
                    <p className="text-sm text-gray-600">
                      Growth: {result.analysis.revenue.growth}
                    </p>
                  )}
                </div>
              )}
              {result.analysis.eps && (
                <div>
                  <h3 className="font-semibold">Earnings Per Share</h3>
                  <p>{result.analysis.eps}</p>
                </div>
              )}
              {result.analysis.guidance && (
                <div>
                  <h3 className="font-semibold">Next Quarter Guidance</h3>
                  <p>{result.analysis.guidance}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Themes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4 space-y-2">
                {result.analysis.keyThemes.map((theme, index) => (
                  <li key={index}>{theme}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {result.analysis.futureOutlook && (
            <Card>
              <CardHeader>
                <CardTitle>Future Outlook</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{result.analysis.futureOutlook}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {mutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{mutation.error.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
