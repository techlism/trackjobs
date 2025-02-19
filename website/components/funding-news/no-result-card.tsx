import { XCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import IllustrationRenderer from "../landing/IllustrationRenderer";

export default function NoResultsCard({ onReset }: { onReset: () => void }) {
    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                    <IllustrationRenderer illustrationAlt="Not Found" illustrationPath="/not_found.svg"/>
                    </div>
                    <div>
                        <p className="text-muted-foreground mb-4">
                            No companies match your current filter criteria. Try adjusting your filters or perform a new search.
                        </p>
                    </div>
                    <div className="flex justify-center gap-4">
                        <Button variant="outline" onClick={onReset}>
                            Reset All Filters
                        </Button>
                        <Button
                            variant="default"
                            onClick={() => window.history.back()}
                        >
                            Go Back
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}