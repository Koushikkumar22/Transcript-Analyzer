import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  AlertCircle,
  TrendingUp,
  Target,
  Lightbulb,
  Brain,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { analyzeTranscript } from "@/lib/api";
import type { Transcript } from "@shared/schema";
import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const { toast } = useToast();
  const [result, setResult] = useState<Transcript | null>(null);
  const [provider, setProvider] = useState<"gemini" | "openai">("gemini");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => analyzeTranscript(file, provider),
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Analysis complete",
        description: "Your transcript has been processed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
      "application/msword": [".doc"],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    onDrop: (acceptedFiles, rejections) => {
      if (rejections.length > 0) {
        toast({
          title: "File rejected",
          description: rejections[0].errors[0]?.message ?? "Invalid file",
          variant: "destructive",
        });
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFileName(file.name);
        mutation.mutate(file);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 py-10 md:py-14">
      <motion.div
        className="container mx-auto max-w-5xl px-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="mb-10 text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Upload • Analyze • Summarize
          </p>
          <h1 className="mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-6xl">
            Earnings Insight AI
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground md:text-lg">
            Extract revenue, EPS, guidance, and strategic themes from transcripts in
            seconds.
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="mb-6 overflow-hidden border shadow-lg">
            <CardHeader className="border-b bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-primary" />
                AI provider
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <RadioGroup
                value={provider}
                onValueChange={(value: "gemini" | "openai") => setProvider(value)}
                className="grid gap-3 md:grid-cols-2"
              >
                <label
                  htmlFor="gemini"
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:border-primary/50"
                >
                  <div className="space-y-1">
                    <p className="font-medium">Gemini</p>
                    <p className="text-xs text-muted-foreground">Fast and balanced</p>
                  </div>
                  <RadioGroupItem value="gemini" id="gemini" />
                </label>
                <label
                  htmlFor="openai"
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:border-primary/50"
                >
                  <div className="space-y-1">
                    <p className="font-medium">OpenAI</p>
                    <p className="text-xs text-muted-foreground">Strong reasoning quality</p>
                  </div>
                  <RadioGroupItem value="openai" id="openai" />
                </label>
              </RadioGroup>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="mb-8 border shadow-lg">
            <CardContent className="pt-6">
              <div
                {...getRootProps()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
                  isDragActive
                    ? "scale-[0.99] border-primary bg-primary/5 shadow-inner"
                    : "border-muted-foreground/30 hover:border-primary hover:bg-primary/5"
                }`}
              >
                <input {...getInputProps()} />
                <Upload
                  className={`mx-auto h-14 w-14 transition-colors duration-300 ${
                    isDragActive ? "text-primary" : "text-primary/70"
                  }`}
                />
                <h3 className="mb-2 mt-4 text-2xl font-bold">
                  {isDragActive ? "Drop to analyze" : "Upload transcript"}
                </h3>
                <p className="text-muted-foreground">Supports TXT, PDF, DOC, DOCX (max 5MB)</p>
                {selectedFileName && (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    <FileText className="h-4 w-4" />
                    {selectedFileName}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {mutation.isPending && (
          <motion.div variants={itemVariants}>
            <Card className="shadow-lg">
              <CardHeader className="border-b bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 animate-pulse text-primary" />
                  Analyzing transcript...
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {result?.analysis && (
          <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden shadow-lg">
                <CardHeader className="border-b bg-primary/5">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Financial metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 pt-6 md:grid-cols-3">
                  {result.analysis.revenue && (
                    <div className="space-y-2 rounded-lg border p-4">
                      <h3 className="font-semibold">Revenue</h3>
                      <p className="text-2xl font-bold text-primary">{result.analysis.revenue.amount}</p>
                      {result.analysis.revenue.growth && (
                        <p className="text-sm text-muted-foreground">
                          Growth: {result.analysis.revenue.growth}
                        </p>
                      )}
                    </div>
                  )}
                  {result.analysis.eps && (
                    <div className="space-y-2 rounded-lg border p-4">
                      <h3 className="font-semibold">EPS</h3>
                      <p className="text-2xl font-bold text-primary">{result.analysis.eps}</p>
                    </div>
                  )}
                  {result.analysis.guidance && (
                    <div className="space-y-2 rounded-lg border p-4 md:col-span-3">
                      <h3 className="font-semibold">Next quarter guidance</h3>
                      <p className="text-muted-foreground">{result.analysis.guidance}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="shadow-lg">
                <CardHeader className="border-b bg-primary/5">
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Key themes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="grid gap-4">
                    {result.analysis.keyThemes.map((theme, index) => (
                      <motion.li
                        key={`${theme}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 * index }}
                        className="flex items-start gap-3"
                      >
                        <Target className="mt-1 h-5 w-5 shrink-0 text-primary" />
                        <span>{theme}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {result.analysis.futureOutlook && (
              <motion.div variants={itemVariants}>
                <Card className="shadow-lg">
                  <CardHeader className="border-b bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Future outlook
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="leading-relaxed text-muted-foreground">
                      {result.analysis.futureOutlook}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        {mutation.isError && (
          <motion.div variants={itemVariants}>
            <Alert variant="destructive" className="animate-shake">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{mutation.error.message}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="mt-8">
          <Card className="border bg-muted/20">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">
                Tip: If analysis fails, verify your provider API key on the backend and try again.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
