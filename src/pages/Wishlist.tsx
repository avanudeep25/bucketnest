
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <SortAsc className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <DropdownMenuRadioItem value="latest">
                      <Clock className="mr-2 h-4 w-4" />
                      Latest First
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="oldest">
                      <ArrowDown className="mr-2 h-4 w-4" />
                      Oldest First
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="title">
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Title (A-Z)
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
